import * as gesso from "./gesso/gesso.js";
import * as main from "./main.js";

const html = `
<body>
  <header>
    <div>
      <div>
        <span class="material-icons-outlined">medical_services</span>
        Patient Portal
      </div>
      <nav id="global-nav">
        <a>Patient <span id="patient-name">-</span></a>
        <a id="log-out-link" href="/">Log out</a>
      </nav>
    </div>
  </header>
  <section>
    <div>

<div class="tabs" id="tab">
  <nav>
    <a data-tab="overview">Overview</a>
    <a data-tab="appointments">Appointments</a>
    <a data-tab="bills">Bills</a>
    <a data-tab="doctors">Doctors</a>
  </nav>

  <div data-tab="overview">
    <h1>Welcome!</h1>

    <p><a class="button" id="appointment-request-create-link">Request an appointment</a></p>

    <p>You have <b id="appointment-request-count">-</b> appointment request(s).</p>

    <p>You have <b id="appointment-count">-</b> upcoming appointment(s).</p>
  </div>

  <div data-tab="appointments">
    <h1>Appointments</h1>

    <div id="appointment-table"></div>
  </div>

  <div data-tab="bills">
    <h1>Bills</h1>

    <div id="bill-table"></div>
  </div>

  <div data-tab="doctors">
    <h1>Doctors</h1>

    <div id="doctor-table"></div>
  </div>
</div>

    </div>
  </section>
  <footer>
  </footer>
</body>
`;

const tabs = new gesso.Tabs("tab");

const appointmentTable = new gesso.Table("appointment-table", [
    ["ID", "id"],
    ["Doctor", "doctor_id", (id, item, data) => data.doctors[id].name],
    ["Date", "date"],
    ["Time", "time"],
]);

const billTable = new gesso.Table("bill-table", [
    ["ID", "id"],
    ["Summary", "summary"],
    ["Amount", "amount", amount => `$${amount}`],
    ["Date paid", "date_paid", date => nvl(date, "-")],
    ["", "id", id => gesso.createLink(null, `/bill/pay?bill=${id}`, {class: "button", text: "Pay"})],
]);

const doctorTable = new gesso.Table("doctor-table", [
    ["ID", "id"],
    ["Name", "name"],
    ["Phone", "phone"],
    ["Email", "email"],
]);

export class MainPage extends gesso.Page {
    constructor(router) {
        super(router, "/patient", html);
    }

    getContentKey() {
        return [this.path, $p("id")].join();
    }

    updateView() {
        tabs.update();
    }

    updateContent() {
        gesso.getJson("/api/data", data => {
            const id = parseInt($p("id"));
            const name = data.patients[id].name;
            const appointmentRequestCreateLink = `/appointment-request/create?patient=${id}`;
            const appointmentRequests = Object.values(data.appointment_requests)
                  .filter(item => item.patient_id === id && item.appointment_id === null);
            const appointments = Object.values(data.appointments).filter(item => item.patient_id === id);
            const bills = Object.values(data.bills).filter(item => item.patient_id === id);
            const doctors = Object.values(data.doctors);

            $("#patient-name").textContent = name;
            $("#appointment-request-create-link").setAttribute("href", appointmentRequestCreateLink);
            $("#appointment-request-count").textContent = appointmentRequests.length;
            $("#appointment-count").textContent = appointments.length;

            appointmentTable.update(appointments, data);
            billTable.update(bills);
            doctorTable.update(doctors);
        });
    }
}
