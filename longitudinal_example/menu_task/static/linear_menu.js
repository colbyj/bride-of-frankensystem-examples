// Linear (drop-down) menu component.
//
// Mounts into a host element and exposes the same surface as MarkingMenu so
// task_runner.js can swap them by condition without conditional logic.
//
// Surface:
//   const menu = LinearMenu(rootEl, commands);
//   menu.enable(); / menu.disable();
//   menu.highlight(cmd); / menu.clearHighlight();
//   menu.onSelect = (cmd) => { ... };
//   menu.destroy();

window.LinearMenu = function (rootEl, commands, options) {
    // Wrap in a child container so the absolutely-positioned panel resolves
    // its `top: 100%; left: 0` against the trigger's tight inline-block box,
    // not against the (potentially large) host element.
    const container = d3.select(rootEl)
        .append('div')
        .attr('class', 'menu linear-menu');

    const trigger = container.append('button')
        .attr('type', 'button')
        .attr('class', 'menu-trigger')
        .text('File ▾');

    const panel = container.append('div')
        .attr('class', 'menu-panel')
        .style('display', 'none');

    // Blind mode: keep the slot structure (so the participant has targets)
    // but hide the command labels. Used during the recall phase to test
    // spatial memory rather than label recognition.
    const blind = !!(options && options.blind);

    const items = panel.selectAll('.menu-item')
        .data(commands)
        .join('div')
        .attr('class', 'menu-item' + (blind ? ' menu-item-blind' : ''))
        .attr('data-command', (d) => d)
        .text((d) => blind ? '—' : d);

    let enabled = false;
    let isOpen = false;
    const api = {
        onSelect: null,
        enable() {
            // Each new trial starts with the menu closed — even if the
            // previous trial's feedback left it open via highlight().
            enabled = true;
            close();
            trigger.attr('disabled', null);
        },
        disable() { enabled = false; close(); trigger.attr('disabled', true); },
        highlight(cmd) {
            items.classed('menu-item-highlighted', (d) => d === cmd);
            // Highlight implies the menu should be visible so the user can see it.
            open();
        },
        clearHighlight() {
            items.classed('menu-item-highlighted', false);
        },
        destroy() {
            document.removeEventListener('click', handleOutsideClick, true);
            container.remove();
        },
    };

    function open() {
        if (isOpen) return;
        isOpen = true;
        panel.style('display', 'block');
    }

    function close() {
        if (!isOpen) return;
        isOpen = false;
        panel.style('display', 'none');
    }

    trigger.on('click', (event) => {
        event.stopPropagation();
        if (!enabled) return;
        if (isOpen) close(); else open();
    });

    items.on('click', (event, command) => {
        event.stopPropagation();
        if (!enabled) return;
        close();
        if (typeof api.onSelect === 'function') api.onSelect(command);
    });

    function handleOutsideClick(event) {
        if (!isOpen) return;
        if (rootEl.contains(event.target)) return;
        close();
    }
    document.addEventListener('click', handleOutsideClick, true);

    api.disable();
    return api;
};
