/* ═══════════════════════════════════════
   M7 Booking Logic
   Country → Date → Time → Details → Confirm
   ═══════════════════════════════════════ */

(function () {
    // ─── CONFIG ───
    const FIRST_AVAILABLE = new Date(2026, 4, 3); // May 3, 2026
    const SLOTS = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    const ARAB_COUNTRIES = ['AE', 'SA', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'SY', 'IQ', 'EG'];
    const BLOCKED_DAYS = [0, 6]; // Sunday, Saturday

    const TELEGRAM_BOT_TOKEN = '8767231953:AAFN6w56pZ4d4h4o5-SZWcttnAGrRnZb1Xo';
    const TELEGRAM_CHAT_ID = '8296598401';

    // ─── STATE ───
    let state = {
        country: null,
        region: null,
        callType: null,
        date: null,
        time: null,
        currentMonth: new Date(FIRST_AVAILABLE),
    };

    // ─── ELEMENTS ───
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const countrySelect = $('#country-select');
    const callTypeDisplay = $('#call-type-display');
    const callTypeIcon = $('#call-type-icon');
    const callTypeText = $('#call-type-text');
    const calDays = $('#cal-days');
    const calMonth = $('#cal-month');
    const calPrev = $('#cal-prev');
    const calNext = $('#cal-next');
    const timeSlots = $('#time-slots');
    const fullyBookedNotice = $('#fully-booked-notice');
    const confirmBtn = $('#confirm-btn');
    const stepCountry = $('#step-country');
    const stepDate = $('#step-date');
    const stepTime = $('#step-time');
    const stepDetails = $('#step-details');
    const bookingSuccess = $('#booking-success');
    const successDetails = $('#success-details');

    // ─── STEP ACTIVATION ───
    function activateStep(step) {
        step.classList.add('active');
    }

    // ─── COUNTRY SELECTION ───
    countrySelect.addEventListener('change', function () {
        const option = this.options[this.selectedIndex];
        state.country = this.value;
        state.region = option.dataset.region;

        if (state.region === 'arab') {
            state.callType = 'video';
            callTypeIcon.textContent = '📹';
            callTypeText.textContent = 'Video Call + Voice Call Available';
        } else {
            state.callType = 'voice';
            callTypeIcon.textContent = '📞';
            callTypeText.textContent = 'Voice Call';
        }

        callTypeDisplay.style.display = 'flex';
        activateStep(stepDate);
        renderCalendar();
    });

    // ─── CALENDAR ───
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    function renderCalendar() {
        const year = state.currentMonth.getFullYear();
        const month = state.currentMonth.getMonth();

        calMonth.textContent = MONTH_NAMES[month].toUpperCase() + ' ' + year;

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = (firstDay.getDay() + 6) % 7; // Monday = 0

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        calDays.innerHTML = '';

        // Empty cells before first day
        for (let i = 0; i < startDay; i++) {
            const el = document.createElement('div');
            el.className = 'cal-day empty';
            calDays.appendChild(el);
        }

        let hasAvailable = false;

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(year, month, d);
            const el = document.createElement('div');
            el.className = 'cal-day';
            el.textContent = d;

            const isBlocked = BLOCKED_DAYS.includes(date.getDay());
            const isPast = date < today;
            const isFull = date < FIRST_AVAILABLE;

            if (isPast || isFull || isBlocked) {
                el.classList.add('full');
            } else {
                el.classList.add('available');
                hasAvailable = true;
                el.addEventListener('click', () => selectDate(date, el));
            }

            if (date.toDateString() === today.toDateString()) {
                el.classList.add('today');
            }

            if (state.date && date.toDateString() === state.date.toDateString()) {
                el.classList.add('selected');
            }

            calDays.appendChild(el);
        }

        // Show fully booked notice
        if (!hasAvailable) {
            fullyBookedNotice.style.display = 'block';
        } else {
            fullyBookedNotice.style.display = 'none';
        }

        // Disable prev arrow if we're at the first available month
        const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        calPrev.style.visibility = state.currentMonth <= minMonth ? 'hidden' : 'visible';
    }

    function selectDate(date, el) {
        state.date = date;

        // Update UI
        $$('.cal-day.selected').forEach(d => d.classList.remove('selected'));
        el.classList.add('selected');

        activateStep(stepTime);
        renderTimeSlots();
    }

    calPrev.addEventListener('click', () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() - 1);
        renderCalendar();
    });

    calNext.addEventListener('click', () => {
        state.currentMonth.setMonth(state.currentMonth.getMonth() + 1);
        renderCalendar();
    });

    // ─── TIME SLOTS ───
    function renderTimeSlots() {
        timeSlots.innerHTML = '';

        SLOTS.forEach(slot => {
            const el = document.createElement('button');
            el.className = 'time-slot';
            el.textContent = slot;
            el.addEventListener('click', () => selectTime(slot, el));
            timeSlots.appendChild(el);
        });
    }

    function selectTime(time, el) {
        state.time = time;

        $$('.time-slot.selected').forEach(s => s.classList.remove('selected'));
        el.classList.add('selected');

        activateStep(stepDetails);
        validateForm();
    }

    // ─── FORM VALIDATION ───
    const formInputs = ['f-name', 'f-email'];

    formInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', validateForm);
    });

    function validateForm() {
        const name = $('#f-name').value.trim();
        const email = $('#f-email').value.trim();
        const hasRequired = name && email && email.includes('@');
        const hasAll = state.country && state.date && state.time && hasRequired;

        confirmBtn.disabled = !hasAll;
    }

    // Listen on all inputs
    document.addEventListener('input', validateForm);

    // ─── CONFIRM BOOKING ───
    confirmBtn.addEventListener('click', async function () {
        if (confirmBtn.disabled) return;

        const textEl = $('.confirm-text');
        const loadingEl = $('.confirm-loading');
        textEl.style.display = 'none';
        loadingEl.style.display = 'inline-flex';
        confirmBtn.disabled = true;

        const booking = {
            name: $('#f-name').value.trim(),
            email: $('#f-email').value.trim(),
            phone: $('#f-phone').value.trim() || '—',
            company: $('#f-company').value.trim() || '—',
            country: countrySelect.options[countrySelect.selectedIndex].text,
            countryCode: state.country,
            callType: state.callType === 'video' ? '📹 Video Call' : '📞 Voice Call',
            date: formatDate(state.date),
            time: state.time + ' CET',
            timestamp: new Date().toISOString(),
        };

        try {
            // Send Telegram notification
            await sendTelegramNotification(booking);

            // Show success
            showSuccess(booking);
        } catch (err) {
            console.error('Booking error:', err);
            // Still show success — notification is secondary
            showSuccess(booking);
        }
    });

    function formatDate(date) {
        const d = date.getDate().toString().padStart(2, '0');
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    function showSuccess(booking) {
        // Hide all steps
        $$('.booking-step').forEach(s => s.style.display = 'none');
        $('.booking-header').style.display = 'none';

        successDetails.innerHTML = `
            <div><strong style="color:var(--gold)">Name:</strong> ${booking.name}</div>
            <div><strong style="color:var(--gold)">Date:</strong> ${booking.date}</div>
            <div><strong style="color:var(--gold)">Time:</strong> ${booking.time}</div>
            <div><strong style="color:var(--gold)">Type:</strong> ${booking.callType}</div>
            <div><strong style="color:var(--gold)">Country:</strong> ${booking.country}</div>
        `;

        bookingSuccess.style.display = 'block';

        // Scroll to success
        bookingSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ─── TELEGRAM NOTIFICATION ───
    async function sendTelegramNotification(booking) {
        const message =
            `🔔 *NEW BOOKING*\n\n` +
            `👤 *${booking.name}*\n` +
            `📧 ${booking.email}\n` +
            `📞 ${booking.phone}\n` +
            `🏢 ${booking.company}\n` +
            `🌍 ${booking.country}\n\n` +
            `📅 *${booking.date}* at *${booking.time}*\n` +
            `${booking.callType}\n\n` +
            `⏰ _${booking.timestamp}_`;

        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'Markdown',
            }),
        });
    }

    // ─── INIT ───
    renderCalendar();
})();
