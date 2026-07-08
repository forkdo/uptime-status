import axios from 'axios';
import dayjs from 'dayjs';
import { formatNumber } from './helper';

export async function GetMonitors(apikey, days) {
  const baseUrl = window.Config?.ApiBaseUrl || 'https://api.uptimerobot.com';
  const timeout = window.Config?.ApiTimeout || 60000;
  const headers = { Authorization: `Bearer ${apikey}` };

  // 第一步：获取所有监控列表
  const monitorsRes = await axios.get(`${baseUrl}/v3/monitors`, { headers, timeout });
  const monitorsData = monitorsRes.data;
  if (monitorsData.error) throw new Error(monitorsData.error.message || monitorsData.error);
  const monitors = monitorsData.data || [];

  // 第二步：获取所有 incidents（故障日志），自动分页
  let allIncidents = [];
  let url = `${baseUrl}/v3/incidents`;
  while (url) {
    const incidentsRes = await axios.get(url, { headers, timeout });
    const incidentsData = incidentsRes.data;
    if (incidentsData.error) throw new Error(incidentsData.error.message || incidentsData.error);
    allIncidents = allIncidents.concat(incidentsData.data || []);
    url = incidentsData.nextLink || null;
  }

  // 计算日期范围
  const dates = [];
  const today = dayjs(new Date().setHours(0, 0, 0, 0));
  for (let d = 0; d < days; d++) {
    dates.push(today.subtract(d, 'day'));
  }

  // 按 monitor id 分组 incidents（只保留有效的：已解决且有持续时间）
  const incidentsByMonitor = {};
  allIncidents.forEach((incident) => {
    const monitorId = incident.monitor?.id;
    if (!monitorId) return;
    if (incident.status !== 'Resolved' || incident.type !== 'Downtime') return;
    if (!incident.resolvedAt || !incident.duration) return;
    if (!incidentsByMonitor[monitorId]) incidentsByMonitor[monitorId] = [];
    incidentsByMonitor[monitorId].push(incident);
  });

  return monitors.map((monitor) => {
    const monitorIncidents = incidentsByMonitor[monitor.id] || [];
    // 服务创建时间（转换为当天 00:00:00）
    const createdAt = monitor.createDateTime ? dayjs(monitor.createDateTime).startOf('day') : null;

    // 计算每天的状态
    const daily = [];
    const map = [];
    dates.forEach((date, index) => {
      map[date.format('YYYYMMDD')] = index;
      daily[index] = {
        date: date,
        uptime: null, // null = 无数据
        down: { times: 0, duration: 0 },
      };
    });

    let totalTimes = 0;
    let totalDuration = 0;
    let validDays = 0; // 只计算服务创建后的天数

    monitorIncidents.forEach((incident) => {
      const startDate = dayjs(incident.startedAt);
      const endDate = dayjs(incident.resolvedAt);

      totalTimes += 1;
      totalDuration += incident.duration;

      dates.forEach((date, index) => {
        // 只处理服务创建后的日期
        if (createdAt && date.isBefore(createdAt)) return;

        const dayStart = date;
        const dayEnd = date.add(1, 'day');

        if (startDate.isBefore(dayEnd) && endDate.isAfter(dayStart)) {
          daily[index].down.times += 1;
          const overlapStart = startDate.isAfter(dayStart) ? startDate : dayStart;
          const overlapEnd = endDate.isBefore(dayEnd) ? endDate : dayEnd;
          daily[index].down.duration += overlapEnd.diff(overlapStart, 'second');
        }
      });
    });

    // 计算每天的可用率
    const DAY_SECONDS = 86400;
    daily.forEach((day, index) => {
      const date = dates[index];

      // 服务创建前的日期 → 无数据
      if (createdAt && date.isBefore(createdAt)) {
        day.uptime = null;
        return;
      }

      // 服务创建后的日期 → 计算可用率
      validDays++;
      if (day.down.times > 0) {
        const uptimeRatio = Math.max(0, (DAY_SECONDS - day.down.duration) / DAY_SECONDS);
        day.uptime = formatNumber(uptimeRatio * 100);
      } else {
        day.uptime = 100;
      }
    });

    const result = {
      id: monitor.id,
      name: monitor.friendlyName || monitor.friendly_name,
      url: monitor.url,
      average: validDays > 0 ? formatNumber(Math.max(0, (validDays * DAY_SECONDS - totalDuration) / (validDays * DAY_SECONDS) * 100)) : null,
      total: { times: totalTimes, duration: totalDuration },
      daily: daily.reverse(),
      status: 'unknow',
    };

    if (monitor.status === 'UP') result.status = 'ok';
    if (monitor.status === 'DOWN') result.status = 'down';

    return result;
  });
}
