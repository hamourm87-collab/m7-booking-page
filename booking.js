/* ═══════════════════════════════════
   M7 Booking Logic V2
   ═══════════════════════════════════ */
(function () {
    const FIRST_AVAILABLE = new Date(2026, 4, 3);
    const SLOTS = ['09:00','10:00','11:00','12:00','14:00','15:00','16:00','17:00'];
    const ARAB = ['AE','SA','QA','KW','BH','OM','JO','LB','SY','IQ','EG'];
    const BLOCKED = [0, 6];
    const BOT = '8767231953:AAFN6w56pZ4d4h4o5-SZWcttnAGrRnZb1Xo';
    const CHAT = '8296598401';
    const MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

    let state = { country: null, region: null, callType: null, date: null, time: null, month: new Date(FIRST_AVAILABLE) };

    const $ = s => document.querySelector(s);
    const $$ = s => document.querySelectorAll(s);

    function activate(id) { document.getElementById(id).classList.add('active'); }

    // Country
    $('#country-select').addEventListener('change', function () {
        const opt = this.options[this.selectedIndex];
        state.country = this.value;
        state.region = opt.dataset.region;
        state.callType = state.region === 'arab' ? 'video' : 'voice';
        $('#call-icon').textContent = state.callType === 'video' ? '📹' : '📞';
        $('#call-text').textContent = state.callType === 'video' ? 'Video Call + Voice Call Available' : 'Voice Call';
        $('#call-badge').style.display = 'flex';
        activate('bstep-2');
        renderCal();
    });

    // Calendar
    function renderCal() {
        const y = state.month.getFullYear(), m = state.month.getMonth();
        $('#cal-month').textContent = MONTHS[m] + ' ' + y;
        const first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
        const startDay = (first.getDay() + 6) % 7;
        const today = new Date(); today.setHours(0,0,0,0);
        const days = document.getElementById('cal-days');
        days.innerHTML = '';
        let hasAvail = false;

        for (let i = 0; i < startDay; i++) {
            const d = document.createElement('div');
            d.className = 'cd empty';
            days.appendChild(d);
        }
        for (let d = 1; d <= last.getDate(); d++) {
            const date = new Date(y, m, d);
            const el = document.createElement('div');
            el.className = 'cd';
            el.textContent = d;
            if (date < today || date < FIRST_AVAILABLE || BLOCKED.includes(date.getDay())) {
                el.classList.add('full');
            } else {
                el.classList.add('avail');
                hasAvail = true;
                el.addEventListener('click', () => pickDate(date, el));
            }
            if (date.toDateString() === today.toDateString()) el.classList.add('today');
            if (state.date && date.toDateString() === state.date.toDateString()) el.classList.add('sel');
            days.appendChild(el);
        }

        const notice = document.getElementById('booked-notice');
        notice.style.display = hasAvail ? 'none' : 'block';

        const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        $('#cal-prev').style.visibility = state.month <= minMonth ? 'hidden' : 'visible';
    }

    function pickDate(date, el) {
        state.date = date;
        $$('.cd.sel').forEach(d => d.classList.remove('sel'));
        el.classList.add('sel');
        activate('bstep-3');
        renderTime();
    }

    $('#cal-prev').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() - 1); renderCal(); });
    $('#cal-next').addEventListener('click', () => { state.month.setMonth(state.month.getMonth() + 1); renderCal(); });

    // Time
    function renderTime() {
        const grid = document.getElementById('time-grid');
        grid.innerHTML = '';
        SLOTS.forEach(s => {
            const el = document.createElement('button');
            el.className = 'ts';
            el.textContent = s;
            el.addEventListener('click', () => pickTime(s, el));
            grid.appendChild(el);
        });
    }

    function pickTime(time, el) {
        state.time = time;
        $$('.ts.sel').forEach(s => s.classList.remove('sel'));
        el.classList.add('sel');
        activate('bstep-4');
        validate();
    }

    // Validate
    function validate() {
        const n = $('#f-name').value.trim();
        const e = $('#f-email').value.trim();
        $('#submit-btn').disabled = !(state.country && state.date && state.time && n && e.includes('@'));
    }
    document.addEventListener('input', validate);

    // Submit
    $('#submit-btn').addEventListener('click', async function () {
        if (this.disabled) return;
        $('.submit-text').style.display = 'none';
        $('.submit-load').style.display = 'inline-flex';
        this.disabled = true;

        const b = {
            name: $('#f-name').value.trim(),
            email: $('#f-email').value.trim(),
            phone: $('#f-phone').value.trim() || '—',
            company: $('#f-company').value.trim() || '—',
            country: $('#country-select').options[$('#country-select').selectedIndex].text,
            callType: state.callType === 'video' ? '📹 Video Call' : '📞 Voice Call',
            date: fmtDate(state.date),
            time: state.time + ' CET',
        };

        try {
            await fetch(`https://api.telegram.org/bot${BOT}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT,
                    text: `🔔 *NEW BOOKING*\n\n👤 *${b.name}*\n📧 ${b.email}\n📞 ${b.phone}\n🏢 ${b.company}\n🌍 ${b.country}\n\n📅 *${b.date}* at *${b.time}*\n${b.callType}`,
                    parse_mode: 'Markdown',
                }),
            });
        } catch (e) {}

        // Show success
        $$('.bstep').forEach(s => s.style.display = 'none');
        $('#booking-done').style.display = 'block';
        $('#done-details').innerHTML = `
            <div><strong style="color:var(--gold)">Name:</strong> ${b.name}</div>
            <div><strong style="color:var(--gold)">Date:</strong> ${b.date}</div>
            <div><strong style="color:var(--gold)">Time:</strong> ${b.time}</div>
            <div><strong style="color:var(--gold)">Type:</strong> ${b.callType}</div>
            <div><strong style="color:var(--gold)">Country:</strong> ${b.country}</div>
        `;
        $('#booking-done').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    function fmtDate(d) {
        return d.getDate().toString().padStart(2,'0') + '.' + (d.getMonth()+1).toString().padStart(2,'0') + '.' + d.getFullYear();
    }

    renderCal();
})();
