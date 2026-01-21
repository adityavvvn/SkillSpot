import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

// Enhanced color palette for different skills
const colorPalette = [
  '#3b82f6', // Blue
  '#10b981', // Green
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#f43f5e', // Rose
];

// Generate a color for each skill
const generateSkillColors = (skills) => {
  const colors = {};
  skills.forEach((skill, index) => {
    colors[skill.skill] = colorPalette[index % colorPalette.length];
  });
  return colors;
};

const EnhancedSkillGraph = ({ data = [], width = 800, height = 400, isResume = false }) => {
  const ref = useRef();
  const [containerWidth, setContainerWidth] = useState(width);

  // Handle responsive sizing
  useEffect(() => {
    const updateWidth = () => {
      if (ref.current) {
        const container = ref.current.parentElement;
        const availableWidth = container.clientWidth;
        // Use available width but cap at original width for desktop
        const newWidth = Math.min(availableWidth - 32, width); // 32px for padding
        setContainerWidth(newWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width]);

  useEffect(() => {
    if (!data || data.length === 0) {
      // Show empty state
      const svg = d3.select(ref.current);
      svg.selectAll('*').remove();

      svg.append('text')
        .attr('x', containerWidth / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', isResume ? '14px' : '16px')
        .attr('fill', '#6b7280')
        .text('No skills data available. Add some skills to see the graph.');

      return;
    }

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove(); // Clear previous

    const margin = {
      top: isResume ? 40 : 50,
      right: isResume ? 40 : 60,
      bottom: isResume ? 50 : 60,
      left: isResume ? 50 : 60
    };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Generate colors for skills
    const skillColors = generateSkillColors(data);

    // Filter out skills with no proficiency data
    const validSkills = data.filter(skill =>
      skill.proficiency && skill.proficiency.length > 0
    );

    if (validSkills.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', isResume ? '14px' : '16px')
        .attr('fill', '#6b7280')
        .text('No proficiency data available. Add proficiency entries to your skills.');
      return;
    }

    // Flatten all dates and get date range
    const allPoints = validSkills.flatMap(d => d.proficiency);
    const allDates = allPoints.map(d => new Date(d.date));

    // Ensure we have valid date range
    if (allDates.length === 0) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', isResume ? '14px' : '16px')
        .attr('fill', '#6b7280')
        .text('No valid date data found.');
      return;
    }

    const xDomain = d3.extent(allDates);
    const yDomain = [0, Math.max(5, d3.max(allPoints, d => d.level) + 1)];

    // Scales
    const x = d3.scaleTime().domain(xDomain).range([0, innerWidth]);
    const y = d3.scaleLinear().domain(yDomain).range([innerHeight, 0]);

    // Enhanced axes for resume
    const xAxis = d3.axisBottom(x)
      .ticks(Math.min(6, validSkills.length + 2))
      .tickFormat(d3.timeFormat(isResume ? '%b %Y' : '%b %Y'));

    const yAxis = d3.axisLeft(y)
      .ticks(6)
      .tickFormat(d => isResume ? `${d}` : `Lv ${d}`);

    // Draw axes with enhanced styling
    svg.append('g')
      .attr('transform', `translate(${margin.left},${innerHeight + margin.top})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-size', isResume ? '11px' : '12px')
      .attr('fill', isResume ? '#4b5563' : '#6b7280')
      .attr('font-weight', isResume ? '500' : 'normal');

    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(yAxis)
      .selectAll('text')
      .attr('font-size', isResume ? '11px' : '12px')
      .attr('fill', isResume ? '#4b5563' : '#6b7280')
      .attr('font-weight', isResume ? '500' : 'normal');

    // Add axis labels with enhanced styling
    if (!isResume) {
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#374151')
        .attr('font-weight', '600')
        .text('Time');

      svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', 15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#374151')
        .attr('font-weight', '600')
        .text('Proficiency Level');
    }

    // Draw enhanced grid lines
    svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .call(d3.axisLeft(y).tickSize(-innerWidth).tickFormat(''))
      .selectAll('line')
      .attr('stroke', isResume ? '#f3f4f6' : '#e5e7eb')
      .attr('stroke-width', isResume ? 0.5 : 1)
      .attr('stroke-dasharray', isResume ? '2,2' : 'none');

    // Create gradients for each skill
    const defs = svg.append('defs');

    validSkills.forEach(skill => {
      const gradient = defs.append('linearGradient')
        .attr('id', `gradient-${skill.skill.replace(/\s+/g, '-')}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', skillColors[skill.skill])
        .attr('stop-opacity', isResume ? 0.4 : 0.3);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', skillColors[skill.skill])
        .attr('stop-opacity', isResume ? 0.1 : 0.05);
    });

    // Draw lines and areas for each skill
    validSkills.forEach(skill => {
      if (!skill.proficiency || skill.proficiency.length === 0) return;

      // Sort proficiency by date
      const sortedProficiency = [...skill.proficiency].sort((a, b) =>
        new Date(a.date) - new Date(b.date)
      );

      const line = d3.line()
        .x(d => x(new Date(d.date)))
        .y(d => y(d.level))
        .curve(d3.curveMonotoneX);

      const area = d3.area()
        .x(d => x(new Date(d.date)))
        .y0(innerHeight)
        .y1(d => y(d.level))
        .curve(d3.curveMonotoneX);

      // Draw area under the line
      svg.append('path')
        .datum(sortedProficiency)
        .attr('fill', `url(#gradient-${skill.skill.replace(/\s+/g, '-')})`)
        .attr('d', area)
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Draw the line with enhanced styling
      svg.append('path')
        .datum(sortedProficiency)
        .attr('fill', 'none')
        .attr('stroke', skillColors[skill.skill])
        .attr('stroke-width', isResume ? 2.5 : 3)
        .attr('d', line)
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .style('opacity', isResume ? 0.9 : 0.8)
        .style('filter', isResume ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'none');

      // Draw enhanced points
      svg.selectAll(`.dot-${skill.skill.replace(/\s+/g, '-')}`)
        .data(sortedProficiency)
        .enter()
        .append('circle')
        .attr('class', `dot-${skill.skill.replace(/\s+/g, '-')}`)
        .attr('cx', d => x(new Date(d.date)) + margin.left)
        .attr('cy', d => y(d.level) + margin.top)
        .attr('r', isResume ? 4 : 6)
        .attr('fill', skillColors[skill.skill])
        .attr('stroke', '#fff')
        .attr('stroke-width', isResume ? 1.5 : 2)
        .style('cursor', 'pointer')
        .style('filter', isResume ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none')
        .on('mouseover', function (event, d) {
          if (!isResume) {
            d3.select(this).attr('r', 8);

            // Show enhanced tooltip
            const tooltip = svg.append('g')
              .attr('class', 'tooltip')
              .attr('transform', `translate(${event.pageX - ref.current.getBoundingClientRect().left + 10}, ${event.pageY - ref.current.getBoundingClientRect().top - 10})`);

            tooltip.append('rect')
              .attr('width', 140)
              .attr('height', 70)
              .attr('fill', '#1f2937')
              .attr('rx', 6)
              .style('filter', 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))');

            tooltip.append('text')
              .attr('x', 8)
              .attr('y', 20)
              .attr('fill', '#fff')
              .attr('font-size', 12)
              .attr('font-weight', '600')
              .text(skill.skill);

            tooltip.append('text')
              .attr('x', 8)
              .attr('y', 35)
              .attr('fill', '#d1d5db')
              .attr('font-size', 11)
              .text(`Level: ${d.level}/5`);

            tooltip.append('text')
              .attr('x', 8)
              .attr('y', 50)
              .attr('fill', '#d1d5db')
              .attr('font-size', 11)
              .text(d3.timeFormat('%b %Y')(new Date(d.date)));

            // Add certificate count if available
            if (skill.certificates && skill.certificates.length > 0) {
              tooltip.append('text')
                .attr('x', 8)
                .attr('y', 65)
                .attr('fill', '#10b981')
                .attr('font-size', 10)
                .text(`${skill.certificates.length} certificate${skill.certificates.length > 1 ? 's' : ''}`);
            }
          }
        })
        .on('mouseout', function () {
          if (!isResume) {
            d3.select(this).attr('r', 6);
            svg.selectAll('.tooltip').remove();
          }
        });
    });

    // Enhanced legend
    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${isResume ? 5 : 10})`);

    validSkills.forEach((skill, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * (isResume ? 120 : 140)}, 0)`);

      legendItem.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', isResume ? 4 : 6)
        .attr('fill', skillColors[skill.skill])
        .attr('stroke', '#fff')
        .attr('stroke-width', isResume ? 1 : 1.5);

      legendItem.append('text')
        .attr('x', isResume ? 8 : 12)
        .attr('y', isResume ? 2 : 4)
        .attr('font-size', isResume ? '10px' : '12px')
        .attr('fill', isResume ? '#374151' : '#374151')
        .attr('font-weight', isResume ? '500' : 'normal')
        .text(skill.skill);

      // Add certificate indicator for resume
      if (isResume && skill.certificates && skill.certificates.length > 0) {
        legendItem.append('text')
          .attr('x', isResume ? 8 : 12)
          .attr('y', isResume ? 12 : 16)
          .attr('font-size', '8px')
          .attr('fill', '#10b981')
          .attr('font-weight', '600')
          .text(`📜 ${skill.certificates.length}`);
      }
    });

  }, [data, containerWidth, height, isResume, width]);

  return (
    <div className={`w-full ${isResume ? 'overflow-visible' : 'overflow-x-auto'}`}>
      <svg ref={ref} width={containerWidth} height={height} />
    </div>
  );
};

export default EnhancedSkillGraph;
