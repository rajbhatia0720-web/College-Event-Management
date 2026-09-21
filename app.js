const events = [
  { name: 'Techxter 2026', category: 'Technical', date: '30 SEP', time: '09:00', location: 'Main Auditorium', description: 'Build. Break. Rebuild. The campus hackathon for ideas that refuse to stay small.', art: 'art-tech', capacity: 300, organizer: 'Innovation Cell', fee: 'Free', requirement: 'Bring your laptop' },
  { name: 'Rang — open mic night', category: 'Cultural', date: '04 OCT', time: '18:30', location: 'Amphitheatre', description: 'Music, poetry and stories from the voices that make our campus.', art: 'art-culture', capacity: 180, organizer: 'Cultural Committee', fee: '₹50', requirement: 'Open to all students' },
  { name: 'Blood Donation Camp', category: 'Social', date: '29 SEP', time: '09:00', location: 'Main Auditorium', description: 'A small act can make a life-changing difference. Walk in and donate.', art: 'art-social', capacity: 120, organizer: 'NSS Unit', fee: 'Free', requirement: 'College ID required' },
  { name: 'Robotics Line-Follower Challenge', category: 'Technical', date: '11 OCT', time: '10:00', location: 'Innovation Lab', description: 'Design, build and race your autonomous machine against the clock.', art: 'art-robot', capacity: 80, organizer: 'Robotics Club', fee: '₹100', requirement: 'Team registration' },
  { name: 'Inter-college Football', category: 'Sports', date: '15 OCT', time: '16:00', location: 'University Ground', description: 'The season opener is here. Bring your squad and your loudest voice.', art: 'art-sports', capacity: 500, organizer: 'Sports Council', fee: 'Free', requirement: 'Sports shoes recommended' },
  { name: 'Placement Readiness Seminar', category: 'Social', date: '18 OCT', time: '11:00', location: 'Seminar Hall B', description: 'Practical advice, real stories and a clearer path to your first offer.', art: 'art-seminar', capacity: 160, organizer: 'Career Services', fee: 'Free', requirement: 'Register with college email' },
  { name: 'Design Jam: Better Campus', category: 'Technical', date: '22 OCT', time: '14:00', location: 'Studio 04', description: 'A hands-on workshop for turning everyday campus friction into better ideas.', art: 'art-design', capacity: 60, organizer: 'Design Society', fee: 'Free', requirement: 'Bring sketchbook' },
  { name: 'Freshers Garba Night', category: 'Cultural', date: '28 OCT', time: '19:00', location: 'Central Courtyard', description: 'Bring your brightest colors for a night of music, movement and new friends.', art: 'art-culture', capacity: 400, organizer: 'Student Council', fee: '₹80', requirement: 'Traditional wear encouraged' }
];

const state = { role: 'student', currentView: 'overview', calendarMonth: 8, calendarYear: 2026, tickets: JSON.parse(localStorage.getItem('campusloop-tickets') || '[]'), students: JSON.parse(localStorage.getItem('campusloop-students') || '[]'), attendance: JSON.parse(localStorage.getItem('campusloop-attendance') || '{}'), reminders: JSON.parse(localStorage.getItem('campusloop-reminders') || '{}') };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  $('#toast-region').append(toast);
  setTimeout(() => toast.remove(), 2800);
}

function setRole(role) {
  state.role = role;
  $$('.role-tab').forEach((tab) => {
    const active = tab.dataset.role === role;
    tab.classList.toggle('active', active);
    tab.setAttribute('aria-selected', active);
  });
  const isAdmin = role === 'admin';
  $('#email').value = isAdmin ? 'admin@college.edu' : 'student@college.edu';
  $('#password').value = isAdmin ? 'admin123' : 'campus123';
  $('#login-label').textContent = isAdmin ? 'Enter admin console' : 'Enter student space';
  $('#demo-hint').textContent = isAdmin ? 'Demo: admin@college.edu / admin123' : 'Demo: student@college.edu / campus123';
  $('#signup-link').textContent = isAdmin ? 'Request admin access' : 'Create a student account';
}

function login(event) {
  event.preventDefault();
  const email = $('#email').value.trim();
  const isAdmin = state.role === 'admin';
  const name = isAdmin ? 'Event Admin' : (email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) || 'Aarav Shah');
  $('#auth-screen').classList.add('hidden');
  $('#app-screen').classList.remove('hidden');
  $('#workspace-role').textContent = isAdmin ? 'Admin console' : 'Student space';
  $('#workspace-email').textContent = email;
  $('#profile-name').textContent = name;
  $('#profile-role').textContent = isAdmin ? 'Administrator' : 'Student';
  $('#profile-avatar').textContent = isAdmin ? 'EA' : name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  $('#welcome-title').innerHTML = isAdmin ? 'Welcome back, Admin <span>✦</span>' : `Good evening, ${name} <span>✦</span>`;
  $('#welcome-subtitle').textContent = isAdmin ? 'Your campus is moving. Here is what needs your attention.' : 'The best campus moments are waiting for you.';
  $$('.admin-only').forEach((item) => item.classList.toggle('hidden', !isAdmin));
  $('#top-create-button').classList.toggle('hidden', !isAdmin);
  $('#top-create-label').textContent = isAdmin ? 'Create event' : '';
  if (isAdmin) { renderAdminDashboard(); renderAttendance(); renderParticipants(); }
  renderTickets();
  renderUpcoming();
  showToast(`Signed in to your ${isAdmin ? 'admin' : 'student'} space`);
}

function renderEventCard(event) {
  const categoryClass = event.category.toLowerCase();
  const adminAction = state.role === 'admin' ? `<button class="small-button danger-button delete-event" data-event="${event.name}">Delete</button>` : '';
  const claimed = state.tickets.filter((ticket) => ticket.event === event.name).length;
  const seatsLeft = Math.max(0, (event.capacity || 100) - claimed);
  return `<article class="event-card"><div class="event-art ${event.art}"><span class="art-label">${event.category.toUpperCase()}<br><b>${event.date.split(' ')[0]}</b></span></div><div class="event-card-info"><div class="event-meta"><span class="category-pill ${categoryClass}">${event.category.toUpperCase()}</span><span>${event.date} · ${event.time}</span></div><h3>${event.name}</h3><p>${event.description}</p><div class="event-detail-line"><span>◉ ${event.location}</span><span>♙ ${event.organizer}</span></div><div class="event-detail-line"><span>♧ ${event.fee}</span><span class="availability ${seatsLeft < 20 ? 'limited' : ''}">${seatsLeft} spots left</span></div><div class="event-card-bottom"><span class="requirement">${event.requirement}</span><span class="card-actions"><button class="small-button view-details" data-event="${event.name}">Details</button>${adminAction}<button class="small-button issue-ticket" data-event="${event.name}">${seatsLeft ? 'Get ticket' : 'Full'} <span>→</span></button></span></div></div></article>`;
}

function renderEvents(filter = 'all', search = '') {
  const filtered = events.filter((event) => (filter === 'all' || event.category === filter) && `${event.name} ${event.description} ${event.location}`.toLowerCase().includes(search.toLowerCase()));
  $('#events-grid').innerHTML = filtered.length ? filtered.map(renderEventCard).join('') : '<div class="empty-state"><div>⌕</div><h2>No events found</h2><p>Try another search or category.</p></div>';
  $$('.issue-ticket').forEach((button) => button.addEventListener('click', () => openTicketModal(button.dataset.event)));
  $$('.view-details').forEach((button) => button.addEventListener('click', () => openDetailsModal(button.dataset.event)));
  $$('.delete-event').forEach((button) => button.addEventListener('click', () => deleteEvent(button.dataset.event)));
}

function openDetailsModal(eventName) {
  const event = events.find((item) => item.name === eventName) || events[0];
  const seatsLeft = Math.max(0, (event.capacity || 100) - state.tickets.filter((ticket) => ticket.event === event.name).length);
  $('#details-art').className = `details-art ${event.art}`;
  $('#details-category').className = `category-pill ${event.category.toLowerCase()}`;
  $('#details-category').textContent = event.category.toUpperCase();
  $('#details-date').textContent = `${event.date} · ${event.time}`;
  $('#details-location').textContent = `◉ ${event.location}`;
  $('#details-title').textContent = event.name;
  $('#details-description').textContent = event.description;
  $('#details-organizer').textContent = event.organizer;
  $('#details-capacity').textContent = `${seatsLeft} of ${event.capacity} spots left`;
  $('#details-fee').textContent = event.fee;
  $('#details-requirement').textContent = event.requirement;
  $('#details-ticket-button').textContent = seatsLeft ? 'Get my ticket  →' : 'Event is full';
  $('#details-ticket-button').disabled = !seatsLeft;
  $('#details-ticket-button').onclick = () => { closeModals(); openTicketModal(event.name); };
  $('#details-modal').classList.remove('hidden');
}

function deleteEvent(eventName) {
  if (state.role !== 'admin') return;
  if (!window.confirm(`Delete ${eventName}? This cannot be undone.`)) return;
  const index = events.findIndex((event) => event.name === eventName);
  if (index >= 0) events.splice(index, 1);
  renderEvents($('.filter.active').dataset.filter, $('#event-search').value);
  renderCalendar();
  showToast(`${eventName} was deleted`);
}

function renderUpcoming() {
  const upcoming = events.slice(2, 5);
  $('#upcoming-list').innerHTML = upcoming.map((event) => `<div class="upcoming-item"><div class="date-block"><strong>${event.date.split(' ')[0]}</strong><small>${event.date.split(' ')[1]}</small></div><div><h4>${event.name}</h4><p>${event.time} · ${event.location}</p></div><button class="small-button issue-ticket" data-event="${event.name}">Get ticket →</button></div>`).join('');
  $$('#upcoming-list .issue-ticket').forEach((button) => button.addEventListener('click', () => openTicketModal(button.dataset.event)));
}

function renderTickets() {
  const tickets = state.tickets;
  $('#ticket-count').textContent = tickets.length;
  $('#stat-tickets').textContent = String(tickets.length).padStart(2, '0');
  $('#tickets-empty').classList.toggle('hidden', tickets.length > 0);
  $('#tickets-list').classList.toggle('hidden', tickets.length === 0);
  $('#tickets-list').innerHTML = tickets.map((ticket) => `<article class="ticket-item"><div class="ticket-side"><strong>PASS</strong><span class="pass-pattern">${ticket.code.slice(-5)}</span></div><div class="ticket-info"><div class="event-meta"><span class="category-pill ${ticket.category.toLowerCase()}">${ticket.category.toUpperCase()}</span><span>CONFIRMED</span></div><h3>${ticket.event}</h3><p>◉ ${ticket.location} &nbsp; · &nbsp; ${ticket.date} at ${ticket.time}</p><div class="ticket-code-row"><small>TICKET ID</small><strong>${ticket.code}</strong></div><div class="ticket-actions"><button class="small-button copy-ticket" data-code="${ticket.code}">Copy ID</button><button class="small-button reminder-ticket ${state.reminders[ticket.code] ? 'reminder-active' : ''}" data-code="${ticket.code}">${state.reminders[ticket.code] ? 'Reminder on' : 'Remind me'}</button><button class="small-button danger-button cancel-ticket" data-code="${ticket.code}">Cancel ticket</button></div></div></article>`).join('');
  $$('.copy-ticket').forEach((button) => button.addEventListener('click', () => copyTicketId(button.dataset.code)));
  $$('.reminder-ticket').forEach((button) => button.addEventListener('click', () => toggleReminder(button.dataset.code)));
  $$('.cancel-ticket').forEach((button) => button.addEventListener('click', () => cancelTicket(button.dataset.code)));
}

function copyTicketId(code) {
  if (navigator.clipboard) navigator.clipboard.writeText(code);
  showToast(`Ticket ID ${code} copied`);
}

function toggleReminder(code) {
  state.reminders[code] = !state.reminders[code];
  localStorage.setItem('campusloop-reminders', JSON.stringify(state.reminders));
  renderTickets();
  showToast(state.reminders[code] ? 'Reminder enabled for this ticket' : 'Reminder disabled');
}

function cancelTicket(code) {
  const ticket = state.tickets.find((item) => item.code === code);
  if (!ticket || !window.confirm(`Cancel your ticket for ${ticket.event}?`)) return;
  state.tickets = state.tickets.filter((item) => item.code !== code);
  delete state.reminders[code];
  localStorage.setItem('campusloop-tickets', JSON.stringify(state.tickets));
  localStorage.setItem('campusloop-reminders', JSON.stringify(state.reminders));
  renderTickets();
  showToast('Ticket cancelled and spot released');
}

function openTicketModal(eventName) {
  const event = events.find((item) => item.name === eventName) || events[0];
  const seatsLeft = Math.max(0, (event.capacity || 100) - state.tickets.filter((ticket) => ticket.event === event.name).length);
  $('#ticket-event-name').value = event.name;
  $('#modal-event-caption').textContent = `${event.date} at ${event.location} · ${seatsLeft} spots left · ${event.fee}`;
  $('#ticket-modal').classList.remove('hidden');
  $('#ticket-name').focus();
}

function issueTicket(event) {
  event.preventDefault();
  const eventName = $('#ticket-event-name').value;
  const eventDetails = events.find((item) => item.name === eventName) || events[0];
  const ticket = { event: eventName, category: eventDetails.category, location: eventDetails.location, date: eventDetails.date, time: eventDetails.time, code: `CEH-${String(events.indexOf(eventDetails) + 1).padStart(3, '0')}-${Math.random().toString(36).slice(2, 7).toUpperCase()}` };
  state.tickets.unshift(ticket);
  localStorage.setItem('campusloop-tickets', JSON.stringify(state.tickets));
  $('#ticket-modal').classList.add('hidden');
  $('#success-event').textContent = eventName;
  $('#success-code').textContent = ticket.code;
  $('#success-modal').classList.remove('hidden');
  $('#ticket-form').reset();
  renderTickets();
}

function showView(view) {
  if (view === 'registrations' || view === 'manage' || view === 'students' || view === 'attendance' || view === 'participants') {
    if (state.role !== 'admin') { showToast('Admin access is required for this view'); return; }
  }
  state.currentView = view;
  $$('.app-view').forEach((section) => section.classList.toggle('hidden', section.id !== `view-${view}`));
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view));
  $('#page-breadcrumb').textContent = view.charAt(0).toUpperCase() + view.slice(1);
  $('.sidebar').classList.remove('open');
  if (view === 'events') renderEvents();
  if (view === 'tickets') renderTickets();
  if (view === 'calendar') renderCalendar();
  if (view === 'students') renderStudents();
  if (view === 'attendance') renderAttendance();
  if (view === 'participants') renderParticipants();
}

function renderAdminDashboard() {
  $('#registrations-body').innerHTML = [
    ['Vihaan Joshi · 23BT031', 'Blood Donation Camp', 'CEH-010-1Z1G'],
    ['Tara Bhatt · 22IT018', 'Placement Readiness Seminar', 'CEH-005-1MLC1'],
    ['Aditya Pillai · 24EC004', 'Robotics Line-Follower Challenge', 'CEH-006-10160'],
    ['Nisha Reddy · 21CS088', 'Techxter 2026', 'CEH-001-8D2QK']
  ].map(([student, event, code]) => `<tr><td><strong>${student}</strong></td><td>${event}</td><td>${code}</td><td class="status-confirmed">Confirmed</td></tr>`).join('');
}

const registrationSeed = [
  { name: 'Vihaan Joshi', id: '23BT031', event: 'Blood Donation Camp', code: 'CEH-010-1Z1G' },
  { name: 'Tara Bhatt', id: '22IT018', event: 'Placement Readiness Seminar', code: 'CEH-005-1MLC1' },
  { name: 'Aditya Pillai', id: '24EC004', event: 'Robotics Line-Follower Challenge', code: 'CEH-006-10160' },
  { name: 'Nisha Reddy', id: '21CS088', event: 'Techxter 2026', code: 'CEH-001-8D2QK' },
  { name: 'Aarav Sharma', id: '22CS001', event: 'Robotics Line-Follower Challenge', code: 'CEH-006-1M2M2' },
  { name: 'Diya Menon', id: '22CS014', event: 'Techxter 2026', code: 'CEH-001-2P7LQ' }
];

function eventRegistrations() {
  return [...registrationSeed, ...state.tickets.map((ticket, index) => ({ name: $('#ticket-name')?.value || 'Campus participant', id: 'Guest', event: ticket.event, code: ticket.code || `CEH-GUEST-${index}` }))];
}

function renderAttendance() {
  const registrations = eventRegistrations();
  const eventNames = [...new Set(registrations.map((registration) => registration.event))];
  const select = $('#attendance-event');
  const selected = select.value || 'all';
  select.innerHTML = `<option value="all">All events</option>${eventNames.map((name) => `<option value="${name}">${name}</option>`).join('')}`;
  select.value = eventNames.includes(selected) || selected === 'all' ? selected : 'all';
  const search = $('#attendance-search').value.toLowerCase();
  const filtered = registrations.filter((registration) => (select.value === 'all' || registration.event === select.value) && `${registration.name} ${registration.id} ${registration.event}`.toLowerCase().includes(search));
  const checked = filtered.filter((registration) => state.attendance[registration.code]).length;
  $('#attendance-total').textContent = `${checked} / ${filtered.length}`;
  $('#attendance-body').innerHTML = filtered.map((registration) => { const isChecked = Boolean(state.attendance[registration.code]); return `<tr><td><strong>${registration.name}</strong><small class="table-subtext">${registration.event}</small></td><td>${registration.id}</td><td>${registration.code}</td><td><span class="attendance-status ${isChecked ? 'is-present' : ''}">${isChecked ? 'Present' : 'Not checked in'}</span></td><td><button class="table-action ${isChecked ? 'danger-button' : 'checkin-button'} attendance-toggle" data-code="${registration.code}">${isChecked ? 'Undo check-in' : 'Mark present'}</button></td></tr>`; }).join('');
  $$('.attendance-toggle').forEach((button) => button.addEventListener('click', () => toggleAttendance(button.dataset.code)));
}

function toggleAttendance(code) {
  if (state.attendance[code]) delete state.attendance[code]; else state.attendance[code] = true;
  localStorage.setItem('campusloop-attendance', JSON.stringify(state.attendance));
  renderAttendance();
  renderParticipants();
  showToast(state.attendance[code] ? 'Participant marked present' : 'Check-in undone');
}

function renderParticipants() {
  const registrations = eventRegistrations();
  const filter = $('#participant-event-filter').value || 'all';
  const visible = registrations.filter((registration) => filter === 'all' || registration.event === filter);
  const eventNames = [...new Set(registrations.map((registration) => registration.event))];
  $('#participant-event-filter').innerHTML = `<option value="all">All events</option>${eventNames.map((name) => `<option value="${name}">${name}</option>`).join('')}`;
  $('#participant-event-filter').value = filter;
  const checked = visible.filter((registration) => state.attendance[registration.code]).length;
  const turnout = visible.length ? Math.round((checked / visible.length) * 100) : 0;
  $('#participant-total').textContent = visible.length;
  $('#participant-checked').textContent = checked;
  $('#participant-rate').textContent = `${turnout}% turnout`;
  $('#participant-events').textContent = new Set(visible.map((registration) => registration.event)).size;
  $('#participant-average').textContent = `${turnout}%`;
  $('#participant-bars').innerHTML = eventNames.map((name) => { const count = registrations.filter((registration) => registration.event === name).length; const present = registrations.filter((registration) => registration.event === name && state.attendance[registration.code]).length; return `<div class="bar-row"><div><strong>${name}</strong><span>${present}/${count} present</span></div><div class="bar-track"><i style="width:${count ? Math.max(8, (present / count) * 100) : 0}%"></i></div></div>`; }).join('');
  $('#participant-list').innerHTML = visible.slice(0, 6).map((registration) => `<div class="participant-row"><span class="profile-avatar">${registration.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}</span><div><strong>${registration.name}</strong><small>${registration.event}</small></div><span class="attendance-status ${state.attendance[registration.code] ? 'is-present' : ''}">${state.attendance[registration.code] ? 'Present' : 'Registered'}</span></div>`).join('');
}

function renderStudents() {
  const seedStudents = [
    { name: 'Vihaan Joshi', id: '23BT031', department: 'Biotechnology', email: 'vihaan@college.edu' },
    { name: 'Tara Bhatt', id: '22IT018', department: 'Information Technology', email: 'tara@college.edu' },
    { name: 'Aditya Pillai', id: '24EC004', department: 'Electronics', email: 'aditya@college.edu' }
  ];
  const students = state.students.length ? state.students : seedStudents;
  $('#students-body').innerHTML = students.map((student, index) => `<tr><td><strong>${student.name}</strong></td><td>${student.id}</td><td>${student.department}</td><td>${student.email}</td><td><button class="table-action danger-button delete-student" data-index="${index}">Delete</button></td></tr>`).join('');
  $$('.delete-student').forEach((button) => button.addEventListener('click', () => deleteStudent(Number(button.dataset.index))));
}

function deleteStudent(index) {
  if (!window.confirm('Remove this student record?')) return;
  const seedStudents = [
    { name: 'Vihaan Joshi', id: '23BT031', department: 'Biotechnology', email: 'vihaan@college.edu' },
    { name: 'Tara Bhatt', id: '22IT018', department: 'Information Technology', email: 'tara@college.edu' },
    { name: 'Aditya Pillai', id: '24EC004', department: 'Electronics', email: 'aditya@college.edu' }
  ];
  const students = state.students.length ? state.students : seedStudents;
  students.splice(index, 1);
  state.students = students;
  localStorage.setItem('campusloop-students', JSON.stringify(students));
  renderStudents();
  showToast('Student record deleted');
}

function renderCalendar() {
  const monthDate = new Date(state.calendarYear, state.calendarMonth, 1);
  const monthName = monthDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  $('#calendar-month').textContent = monthName;
  const firstDay = monthDate.getDay();
  const daysInMonth = new Date(state.calendarYear, state.calendarMonth + 1, 0).getDate();
  const cells = [];
  ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((day) => cells.push(`<div class="calendar-weekday">${day}</div>`));
  for (let index = 0; index < firstDay; index += 1) cells.push('<div class="calendar-day muted-day"></div>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayEvents = events.filter((event) => Number(event.date.split(' ')[0]) === day && event.date.includes(monthDate.toLocaleString('en-US', { month: 'short' }).toUpperCase()));
    cells.push(`<div class="calendar-day"><strong>${day}</strong>${dayEvents.map((event) => `<button class="calendar-event ${event.category.toLowerCase()}" data-event="${event.name}">${event.name}</button>`).join('')}</div>`);
  }
  $('#calendar-grid').innerHTML = cells.join('');
  $$('.calendar-event').forEach((button) => button.addEventListener('click', () => openDetailsModal(button.dataset.event)));
}

function addStudent(event) {
  event.preventDefault();
  state.students.push({ name: $('#student-name').value, id: $('#student-id').value, department: $('#student-department').value, email: $('#student-email').value });
  localStorage.setItem('campusloop-students', JSON.stringify(state.students));
  $('#student-form').reset();
  closeModals();
  renderStudents();
  showToast('Student record added');
}

function chatbotReply(message) {
  const text = message.toLowerCase();
  if (text.includes('ticket') || text.includes('register')) return 'Open Explore events, choose an event, then select Get ticket. Your confirmed pass appears under My tickets.';
  if (text.includes('calendar') || text.includes('when') || text.includes('date')) return 'Event calendar shows each scheduled event by date. Students can open a ticket from an event; admins can review dates.';
  if (text.includes('student')) return state.role === 'admin' ? 'Use the Students item in the sidebar to add or remove student records.' : 'Student records are managed by admins. You can still use your college email when claiming a ticket.';
  if (text.includes('delete') || text.includes('remove')) return state.role === 'admin' ? 'Admins can delete events from Explore events and remove students from the Students directory.' : 'Only admins can delete events or student records.';
  return 'I can help with tickets, event dates, student records, deleting events, and admin tools. Try asking about one of those.';
}

function sendChat(event) {
  event.preventDefault();
  const input = $('#chat-input');
  const message = input.value.trim();
  if (!message) return;
  $('#chat-messages').insertAdjacentHTML('beforeend', `<div class="chat-bubble user">${message}</div><div class="chat-bubble bot">${chatbotReply(message)}</div>`);
  input.value = '';
  $('#chat-messages').scrollTop = $('#chat-messages').scrollHeight;
}

function closeModals() { $$('.modal-backdrop').forEach((modal) => modal.classList.add('hidden')); }

$$('.role-tab').forEach((button) => button.addEventListener('click', () => setRole(button.dataset.role)));
$('#login-form').addEventListener('submit', login);
$('#ticket-form').addEventListener('submit', issueTicket);
$('#password-toggle').addEventListener('click', () => { const input = $('#password'); input.type = input.type === 'password' ? 'text' : 'password'; });
$('#logout-button').addEventListener('click', () => { $('#app-screen').classList.add('hidden'); $('#auth-screen').classList.remove('hidden'); $('#chatbot').classList.add('hidden'); showToast('You have been signed out'); });
$('#mobile-menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#notification-button').addEventListener('click', () => showToast('You are all caught up'));
$('#forgot-link').addEventListener('click', (event) => { event.preventDefault(); showToast('Password reset instructions are on their way'); });
$('#signup-link').addEventListener('click', (event) => { event.preventDefault(); showToast('Account creation will open soon'); });
$('#top-create-button').addEventListener('click', () => showView('manage'));
$('#add-student-button').addEventListener('click', () => $('#student-modal').classList.remove('hidden'));
$('#student-form').addEventListener('submit', addStudent);
$('#calendar-prev').addEventListener('click', () => { state.calendarMonth -= 1; if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear -= 1; } renderCalendar(); });
$('#calendar-next').addEventListener('click', () => { state.calendarMonth += 1; if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear += 1; } renderCalendar(); });
$('#chatbot-toggle').addEventListener('click', () => $('#chatbot').classList.toggle('hidden'));
$('#chatbot-close').addEventListener('click', () => $('#chatbot').classList.add('hidden'));
$('#chat-form').addEventListener('submit', sendChat);
$('#attendance-event').addEventListener('change', renderAttendance);
$('#attendance-search').addEventListener('input', renderAttendance);
$('#participant-event-filter').addEventListener('change', renderParticipants);
$$('[data-close-modal]').forEach((button) => button.addEventListener('click', closeModals));
$$('.modal-backdrop').forEach((modal) => modal.addEventListener('click', (event) => { if (event.target === modal) closeModals(); }));
$$('[data-view]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.view)));
$$('[data-view-target]').forEach((button) => button.addEventListener('click', () => showView(button.dataset.viewTarget)));
$('#hero-action').addEventListener('click', () => showView('events'));
$('#event-search').addEventListener('input', (event) => renderEvents($('.filter.active').dataset.filter, event.target.value));
$$('.filter').forEach((button) => button.addEventListener('click', () => { $$('.filter').forEach((item) => item.classList.remove('active')); button.classList.add('active'); renderEvents(button.dataset.filter, $('#event-search').value); }));
$('#create-event-form').addEventListener('submit', (event) => { event.preventDefault(); const name = $('#new-event-name').value; const dateTime = new Date($('#new-event-date').value); const date = Number.isNaN(dateTime.getTime()) ? 'NEW' : `${String(dateTime.getDate()).padStart(2, '0')} ${dateTime.toLocaleString('en-US', { month: 'short' }).toUpperCase()}`; const time = Number.isNaN(dateTime.getTime()) ? 'TBA' : dateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }); events.unshift({ name, category: $('#new-event-category').value, date, time, location: $('#new-event-location').value, organizer: $('#new-event-organizer').value, capacity: Number($('#new-event-capacity').value), fee: 'Free', requirement: 'College ID required', description: $('#new-event-description').value || 'A new campus event is ready for registrations.', art: 'art-design' }); event.target.reset(); showToast(`${name} has been published`); showView('events'); });

renderEvents();
renderUpcoming();
renderCalendar();
setRole('student');
