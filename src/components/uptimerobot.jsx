import { useEffect, useState } from 'react';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { GetMonitors } from '../common/uptimerobot';
import { formatDuration, formatNumber } from '../common/helper';
import Link from './link';

function UptimeRobot({ apikey }) {

  const status = {
    ok: '正常',
    down: '无法访问',
    unknow: '未知'
  };

  const { CountDays, ShowLink } = window.Config;

  const [monitors, setMonitors] = useState();
  const [error, setError] = useState();

  useEffect(() => {
    GetMonitors(apikey, CountDays).then(setMonitors).catch(setError);
  }, [apikey, CountDays]);

  if (error) return (
    <div className='site'>
      <div className='meta'>
        <span className='status down'>加载失败: {error.message || String(error)}</span>
      </div>
    </div>
  );

  if (monitors) return monitors.map((site) => (
    <div key={site.id} className='site'>
      <div className='meta'>
        <span className='name' dangerouslySetInnerHTML={{ __html: site.name }} />
        {ShowLink && <Link className='link' to={site.url} text={site.name} />}
        <span className={'status ' + site.status}>{status[site.status]}</span>
      </div>
      <div className='timeline'>
        {site.daily.map((data, index) => {
          let status = '';
          let text = data.date.format('YYYY-MM-DD ');
          let bgColor = '#e5e8eb'; // 默认灰色（无数据）

          if (data.uptime === null) {
            status = 'none';
            bgColor = '#e5e8eb';
            text += '无数据';
          }
          else if (data.uptime >= 100) {
            status = 'ok';
            bgColor = '#3bd672';
            text += `可用率 ${formatNumber(data.uptime)}%`;
          }
          else {
            status = 'down';
            // 渐变：绿色 → 黄绿 → 黄色 → 橙色 → 褐色 → 红色
            const u = data.uptime;
            let hue;
            if (u >= 99) hue = 100 - (100 - u) * 20;       // 99-100%: 80-100
            else if (u >= 95) hue = 80 - (99 - u) * 5;     // 95-99%: 60-80
            else if (u >= 80) hue = 60 - (95 - u) * 2;     // 80-95%: 30-60
            else if (u >= 50) hue = 30 - (80 - u) * 0.5;   // 50-80%: 15-30
            else if (u >= 20) hue = 15 - (50 - u) * 0.5;   // 20-50%: 0-15
            else hue = 0;                                    // 0-20%: 红色
            // 非常低的可用率用褐色（降低饱和度）
            const sat = u < 30 ? 60 + (u / 30) * 20 : 80;
            bgColor = `hsl(${Math.max(0, hue)}, ${sat}%, 45%)`;
            text += `故障 ${data.down.times} 次，累计 ${formatDuration(data.down.duration)}，可用率 ${formatNumber(data.uptime)}%`;
          }
          return (<i key={index} className={status} style={{ backgroundColor: bgColor }} data-tooltip-id='tooltip' data-tooltip-content={text} />)
        })}
      </div>
      <div className='summary'>
        <span>{site.daily[0].date.format('YYYY-MM-DD')}</span>
        <span>
          {site.average !== null
            ? site.total.times > 0
              ? `最近 ${CountDays} 天故障 ${site.total.times} 次，累计 ${formatDuration(site.total.duration)}，平均可用率 ${site.average}%`
              : `最近 ${CountDays} 天可用率 ${site.average}%`
            : '无数据'}
        </span>
        <span>今天</span>
      </div>
      <ReactTooltip id='tooltip'/>
    </div>
  ));

  else return (
    <div className='site'>
      <div className='loading' />
    </div>
  );
}

export default UptimeRobot;
