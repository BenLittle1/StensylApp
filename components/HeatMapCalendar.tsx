import { scaleLinear } from 'd3-scale';
import { eachDayOfInterval, format, getDay } from 'date-fns';
import React, { useMemo } from 'react';
import Svg, { Rect } from 'react-native-svg';
import { SessionData } from '../types';

interface Props {
  sessions: SessionData[];
  year?: number;
  cellSize?: number;
  gutter?: number;
}

const DAYS_IN_WEEK = 7;

const HeatMapCalendar: React.FC<Props> = ({
  sessions,
  year = new Date().getFullYear(),
  cellSize = 14,
  gutter = 3,
}) => {
  /** minutes studied per YYYY-MM-DD */
  const { totals, max } = useMemo(() => {
    const obj: Record<string, number> = {};
    sessions.forEach(s => {
      const key = format(new Date(s.completedAt), 'yyyy-MM-dd');
      obj[key] = (obj[key] || 0) + Math.ceil(s.duration / 60);
    });
    return { totals: obj, max: Math.max(1, ...Object.values(obj)) };
  }, [sessions]);

  const days = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);
    return eachDayOfInterval({ start, end });
  }, [year]);

  const color = useMemo(
    () => scaleLinear<string>().domain([0, max]).range(['#e9ecef', '#0a84ff']),
    [max]
  );

  const columns = Math.ceil(days.length / DAYS_IN_WEEK);
  const width = columns * (cellSize + gutter);
  const height = DAYS_IN_WEEK * (cellSize + gutter);

  return (
    <Svg width={width} height={height}>
      {days.map((date, i) => {
        const column = Math.floor(i / DAYS_IN_WEEK);
        const row = getDay(date); // 0-Sun … 6-Sat
        const x = column * (cellSize + gutter);
        const y = row * (cellSize + gutter);
        const key = format(date, 'yyyy-MM-dd');
        const minutes = totals[key] || 0;

        return (
          <Rect
            key={key}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            rx={3}
            fill={color(minutes)}
          />
        );
      })}
    </Svg>
  );
};

export default HeatMapCalendar;
