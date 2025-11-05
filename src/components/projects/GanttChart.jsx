import React, { useMemo } from 'react';
import { format, parseISO, differenceInDays, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export default function GanttChart({ projects }) {
  const chartData = useMemo(() => {
    if (projects.length === 0) return null;

    const dates = projects.flatMap(p => [
      parseISO(p.start_date),
      parseISO(p.end_date)
    ]);
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    const chartStart = startOfMonth(minDate);
    const chartEnd = endOfMonth(maxDate);
    
    const totalDays = differenceInDays(chartEnd, chartStart);
    const months = [];
    let currentDate = chartStart;
    
    while (currentDate <= chartEnd) {
      const monthEnd = endOfMonth(currentDate);
      const daysInView = differenceInDays(
        monthEnd > chartEnd ? chartEnd : monthEnd,
        currentDate
      ) + 1;
      
      months.push({
        label: format(currentDate, 'MMM yyyy'),
        days: daysInView,
        width: (daysInView / totalDays) * 100
      });
      
      currentDate = addDays(monthEnd, 1);
    }

    return { chartStart, chartEnd, totalDays, months };
  }, [projects]);

  if (!chartData || projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No projects to display in Gantt chart
      </div>
    );
  }

  const { chartStart, totalDays, months } = chartData;

  const getBarPosition = (startDate, endDate) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    
    const daysFromStart = differenceInDays(start, chartStart);
    const duration = differenceInDays(end, start) + 1;
    
    const left = (daysFromStart / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const statusColors = {
    planning: '#93C5FD',
    in_progress: '#A78BFA',
    on_hold: '#FCD34D',
    completed: '#86EFAC',
    cancelled: '#FCA5A5',
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Timeline Header */}
        <div className="flex border-b-2 border-gray-300 mb-4">
          {months.map((month, index) => (
            <div
              key={index}
              className="text-center py-3 border-r border-gray-200 text-sm font-semibold text-gray-700"
              style={{ width: `${month.width}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        {/* Project Rows */}
        <div className="space-y-3">
          {projects.map((project) => {
            const barStyle = getBarPosition(project.start_date, project.end_date);
            const progress = project.progress || 0;

            return (
              <div key={project.id} className="relative">
                <div className="flex items-center mb-1">
                  <div className="w-48 flex-shrink-0 pr-4">
                    <div className="font-medium text-sm text-gray-800 truncate">{project.name}</div>
                    <div className="text-xs text-gray-500">
                      {format(parseISO(project.start_date), 'MMM dd')} - {format(parseISO(project.end_date), 'MMM dd')}
                    </div>
                  </div>
                </div>
                
                <div className="relative h-10 bg-gray-100 rounded-[10px] ml-48">
                  <div
                    className="absolute top-1 bottom-1 rounded-[8px] flex items-center px-3"
                    style={{
                      ...barStyle,
                      background: `linear-gradient(90deg, ${statusColors[project.status]}EE 0%, ${statusColors[project.status]} 100%)`,
                      boxShadow: `0 2px 8px ${statusColors[project.status]}66`
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-semibold text-white truncate">
                        {project.name}
                      </span>
                      <span className="text-xs font-bold text-white ml-2">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress overlay */}
                  <div
                    className="absolute top-1 bottom-1 rounded-[8px] opacity-40"
                    style={{
                      left: barStyle.left,
                      width: `calc(${barStyle.width} * ${progress / 100})`,
                      background: '#ffffff',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-8 pt-4 border-t border-gray-200">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-[4px]"
                style={{ background: color }}
              />
              <span className="text-sm text-gray-600 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}