// Marking-menu component (Kurtenbach & Buxton, 1991).
//
// Press-and-hold on the center handle reveals six radial wedges. Drag onto
// a wedge and release to select; release outside any wedge to cancel
// without ending the trial.
//
// Surface matches LinearMenu so task_runner.js is menu-agnostic:
//   const menu = MarkingMenu(rootEl, commands);
//   menu.enable(); / menu.disable();
//   menu.highlight(cmd); / menu.clearHighlight();
//   menu.onSelect = (cmd) => { ... };
//   menu.destroy();

window.MarkingMenu = function (rootEl, commands, options) {
    // Blind mode: keep the wedge structure visible (so the participant has
    // a target to drag toward) but hide the command labels. Used during
    // the recall phase to test spatial/directional memory rather than
    // label recognition.
    const blind = !!(options && options.blind);
    const SIZE = 360;             // svg viewBox
    const CENTER = SIZE / 2;
    const HANDLE_R = 36;
    const INNER_R = 50;
    const OUTER_R = 160;
    const LABEL_R = (INNER_R + OUTER_R) / 2;
    const N = commands.length;
    const SLICE = (Math.PI * 2) / N;

    const root = d3.select(rootEl).classed('menu marking-menu', true);

    const svg = root.append('svg')
        .attr('viewBox', `0 0 ${SIZE} ${SIZE}`)
        .attr('class', 'marking-menu-svg')
        .attr('width', SIZE)
        .attr('height', SIZE);

    // Wedges (hidden until press-down). 0° is 12 o'clock; angles grow clockwise
    // — matches d3.arc's convention so we don't have to convert.
    const arc = d3.arc()
        .innerRadius(INNER_R)
        .outerRadius(OUTER_R);

    const wedgeData = commands.map((cmd, i) => ({
        command: cmd,
        index: i,
        startAngle: (i - 0.5) * SLICE,
        endAngle: (i + 0.5) * SLICE,
    }));

    const wedgeGroup = svg.append('g')
        .attr('class', 'marking-menu-wedges')
        .attr('transform', `translate(${CENTER}, ${CENTER})`)
        .style('display', 'none');

    const wedges = wedgeGroup.selectAll('path')
        .data(wedgeData)
        .join('path')
        .attr('class', 'marking-menu-wedge')
        .attr('data-command', (d) => d.command)
        .attr('d', arc);

    const labels = wedgeGroup.selectAll('text')
        .data(wedgeData)
        .join('text')
        .attr('class', 'marking-menu-label')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .each(function (d) {
            // d3.arc().centroid returns [x, y] for the angular midpoint at the
            // mean radius — but we want a label-specific radius.
            const midAngle = (d.startAngle + d.endAngle) / 2 - Math.PI / 2;
            const x = Math.cos(midAngle) * LABEL_R;
            const y = Math.sin(midAngle) * LABEL_R;
            d3.select(this).attr('x', x).attr('y', y).text(blind ? '—' : d.command);
        });

    // Center handle.
    const handle = svg.append('circle')
        .attr('class', 'marking-menu-handle')
        .attr('cx', CENTER)
        .attr('cy', CENTER)
        .attr('r', HANDLE_R);

    const handleLabel = svg.append('text')
        .attr('class', 'marking-menu-handle-label')
        .attr('x', CENTER)
        .attr('y', CENTER)
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .text('Hold');

    let enabled = false;
    let dragging = false;
    let highlightCmd = null;

    const api = {
        onSelect: null,
        enable() {
            enabled = true;
            handle.classed('disabled', false);
            handleLabel.classed('disabled', false);
        },
        disable() {
            enabled = false;
            cancelDrag();
            handle.classed('disabled', true);
            handleLabel.classed('disabled', true);
        },
        highlight(cmd) {
            highlightCmd = cmd;
            wedgeGroup.style('display', 'block');
            wedges.classed('marking-menu-wedge-highlighted', (d) => d.command === cmd);
        },
        clearHighlight() {
            highlightCmd = null;
            wedges.classed('marking-menu-wedge-highlighted', false);
            wedges.classed('marking-menu-wedge-hover', false);
            if (!dragging) wedgeGroup.style('display', 'none');
        },
        destroy() {
            document.removeEventListener('mousemove', handleMove);
            document.removeEventListener('mouseup', handleUp);
            root.selectAll('*').remove();
            root.classed('menu marking-menu', false);
        },
    };

    function pointToWedge(clientX, clientY) {
        // Convert client coords to svg viewBox coords.
        const svgNode = svg.node();
        const pt = svgNode.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const ctm = svgNode.getScreenCTM();
        if (!ctm) return null;
        const local = pt.matrixTransform(ctm.inverse());
        const dx = local.x - CENTER;
        const dy = local.y - CENTER;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < INNER_R) return null;
        // atan2 has 0 = +x (3 o'clock); convert to "0 = +y up, clockwise".
        let theta = Math.atan2(dy, dx) + Math.PI / 2;
        if (theta < 0) theta += Math.PI * 2;
        // Wedge i is centered at i*SLICE; boundaries at (i-0.5)*SLICE.
        const idx = Math.floor((theta + SLICE / 2) / SLICE) % N;
        return wedgeData[idx];
    }

    function handleDown(event) {
        if (!enabled) return;
        event.preventDefault();
        dragging = true;
        wedgeGroup.style('display', 'block');
        handle.classed('marking-menu-handle-active', true);
        updateHover(event.clientX, event.clientY);
    }

    function handleMove(event) {
        if (!dragging) return;
        updateHover(event.clientX, event.clientY);
    }

    function handleUp(event) {
        if (!dragging) return;
        const wedge = pointToWedge(event.clientX, event.clientY);
        finishDrag();
        if (wedge && typeof api.onSelect === 'function') {
            api.onSelect(wedge.command);
        }
        // Release outside any wedge: trial is not ended; user must press again.
    }

    function updateHover(clientX, clientY) {
        const wedge = pointToWedge(clientX, clientY);
        wedges.classed('marking-menu-wedge-hover', (d) => wedge && d.command === wedge.command);
    }

    function finishDrag() {
        dragging = false;
        handle.classed('marking-menu-handle-active', false);
        wedges.classed('marking-menu-wedge-hover', false);
        if (highlightCmd === null) wedgeGroup.style('display', 'none');
    }

    function cancelDrag() {
        if (!dragging) return;
        finishDrag();
    }

    handle.on('mousedown', handleDown);
    handleLabel.on('mousedown', handleDown);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);

    api.disable();
    return api;
};
