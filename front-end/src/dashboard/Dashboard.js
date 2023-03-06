import React from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { useHistory } from "react-router-dom";
import { previous, next } from "../utils/date-time";

// Import Reservation component to better display reservations
import Reservation from "../reservations/Reservation";
// Import Table component to better display tables
import Table from "../tables/Table";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date, reservations, reservationsError}) {
const history = useHistory();

  function handleToday() {
    history.push(`/dashboard`);
  }

  function handlePrev() {
    const newDate = previous(date);
    history.push(`/dashboard?date=${newDate}`);
  }
 
  function handleNext() {
    history.push(`/dashboard?date=${next(date)}`);
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <h4 className="mb-0">Reservations for {date}</h4>
      </div>
      <div className="pb-2 d-flex justify-content-center">
        <button className="btn btn-primary mr-1" onClick={handleToday}>
          today
        </button>
        <button className="btn btn-primary mr-1" onClick={handlePrev}>
          previous
        </button>
        <button className="btn btn-primary" onClick={handleNext}>
          next
        </button>
      </div>
      <ErrorAlert error={reservationsError} />
      <Reservation reservations={reservations} />
      <Table />
    </main>
  );
}

export default Dashboard;
