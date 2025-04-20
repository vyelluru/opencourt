import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import './index.css';
import AddUserCity from "./AddUserCity";

function App() {
  const [courtLocations, setCourtLocations] = useState([]);
  const [city, setCity] = useState('');
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [bookingDate, setBookingDate] = useState('');
  const [courtNumber, setCourtNumber] = useState('');
  const [reservedTimes, setReservedTimes] = useState([]);


  const handleInputChange = (e) => {
    setCity(e.target.value);
  };

  const handleButtonClick = async () => {
    const {names, addresses, ratings, numCourts} = await AddUserCity(city);
    console.log("Found courts:", names);
    console.log("Found addresses:", addresses);
    console.log("Found ratings:", ratings);
    console.log("Found number of courts:", numCourts);

    const { data, error } = await supabase.from("court_locations").select().eq('city', city);

    if (data.length == 0) {
      for (let i = 0; i < names.length; i++) {
        await supabase.from('court_locations').insert({name: names[i], city: city, address: addresses[i], rating: ratings[i], numCourts: numCourts[i]});
        console.log('Added to Supabase');
      }
    } else {
      console.log("Already in Supabase");
    }

    if (2 == 2){
      const { data } = await supabase.from("court_locations").select().eq('city', city);
      setCourtLocations(data);
    }
  };


  
  const handleOpenBookingModal = (court) => {
    setSelectedCourt(court);
  }



  const seeCourtAvail = async (myName, myDate) => {
    console.log(myName, myDate);
    if (!myDate || !myName) {
      console.error("Court name or date is missing.");
      return;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select('courtNumber, start_time, end_time')
      .eq('court_name', myName)
      .eq('date', myDate);
    
    if (error) {
      console.error("Supabase error:", error);
    } else if (data && data.length > 0) {
      const times = data.map(r => [r.start_time, r.end_time, r.courtNumber]);
      setReservedTimes(times);
      console.log(reservedTimes);
    } else {
      console.log("No reservations found for this court and date.");
    }
  }

  


  const handleConfirmBooking = async () => {  
    if (new Date(`${bookingDate}T${endTime}`) <= new Date(`${bookingDate}T${startTime}`)) {
      alert('End time must be after start time.');
      return;
    }
  
    // Check for overlapping bookings on the same court and date
    const { data: overlappingBookings, error: fetchError } = await supabase
      .from("reservations")
      .select()
      .eq('court_name', selectedCourt.name)
      .eq('date', bookingDate)
      .eq('courtNumber', courtNumber)
      .or(
        // Check for three types of overlaps:
        `and(start_time.lt.${endTime},end_time.gt.${startTime}),` +     // Overlapping
        `and(start_time.gte.${startTime},end_time.lte.${endTime}),` +   // Contained within
        `and(start_time.lte.${startTime},end_time.gte.${endTime})`      // Contains
      );
  
    if (fetchError) {
      alert('Error checking for existing bookings. Please try again.');
      console.error(fetchError);
      return;
    }
  
    if (overlappingBookings && overlappingBookings.length > 0) {
      alert('This time slot conflicts with an existing booking. Please choose a different time.');
      return;
    }
  
    // If no overlapping bookings, proceed with the reservation
    const { error } = await supabase.from('reservations').insert({
      start_time: startTime,
      end_time: endTime,
      date: bookingDate,
      court_name: selectedCourt.name,
      courtNumber: courtNumber
    });
  
    if (!error) {
      alert('Booking confirmed!');
      // Reset form fields
      setSelectedCourt(null);
      setBookingDate('');
      setEndTime('');
      setCourtNumber('');
      setStartTime('');
    } else {
      alert('Failed to create booking. Please try again.');
      console.error(error);
    }
  };




  return (
    <>
    
    <div className="page-container">
      <div className="top-bar">
        <input
          value={city}
          onChange={handleInputChange}
          placeholder="Enter City"
          className="search-input"
        />
        <button className="search-btn" onClick={handleButtonClick}>Search Courts</button>
        <button type="button" className="logout-btn" onClick={() => supabase.auth.signOut()}>Logout</button>
      </div>

      

      <div className="grid-container">
        {courtLocations.map((location) => (
          <div className="court-card" key={location.id}>
            <h3>{location.name}</h3>
            <h7>{location.address}</h7>
            {location.numCourts > 0 && (
              <h4>{location.numCourts} court{location.numCourts > 0 ? 's' : ''}</h4>
            )}
            <p>⭐ {location.rating}</p>
            <button className="book-btn" onClick={() => handleOpenBookingModal(location)}>
              Book Court
            </button>
            
          </div>
        ))}
      </div>

      
    </div>
    {selectedCourt && (
      <div className="modal">
        <div className="modal-content">
          <h2>Book: {selectedCourt.name}</h2>

          <label>Date:</label>
          <input type="date" value={bookingDate} onChange={e => setBookingDate(e.target.value)} />

          <button onClick={() => seeCourtAvail(selectedCourt.name, bookingDate)}>See Court Availability</button>
          <div>
            {/* Show reserved times */}
            <h3>Reserved Court Times</h3>
            <ul>
              {reservedTimes.length > 0 ? (
                reservedTimes.map((time, index) => (
                  <li key={index}>
                    {`Court Number: ${time[2]}, Start Time: ${time[0]}, End Time: ${time[1]}`}
                  </li>
                ))
              ) : (
                <li>No reserved times available</li>
              )}
            </ul>
          </div>

          <p></p>
          <p></p>
          <p></p>


          <label>Court Number:</label>
          <input type="number" value={courtNumber} onChange={e => setCourtNumber(Number(e.target.value))} />
          <p></p>

          <label>Start Time:</label>
          <input type="time" step="3600" value={startTime} onChange={e => setStartTime(e.target.value)} />
          <p></p>

          <label>End Time:</label>
          <input type="time" step="3600" value={endTime} onChange={e => setEndTime(e.target.value)} />
          <p></p>

          <div className="modal-buttons">
            <button onClick={handleConfirmBooking}>Confirm</button>
            <button onClick={() => setSelectedCourt(null)}>Cancel</button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
export default App;