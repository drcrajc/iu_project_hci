// Chugg.com Train Booking System JavaScript

// Function to toggle the display of return date based on checkbox
function toggleReturnDate() {
    const returnJourney = document.getElementById('returnJourney');
    const returnDateContainer = document.getElementById('returnDateContainer');
    
    if (returnJourney.checked) {
        returnDateContainer.style.display = 'flex';
    } else {
        returnDateContainer.style.display = 'none';
    }
}

// Get train speed based on train type
function getTrainSpeed(trainType) {
    switch(trainType) {
        case "Express":
            return 200; // Base speed: 200 km/hr
        case "Super Fast Express":
            return 250; // 50 km/hr faster than Express
        case "Bullet Train":
            return 450; // 200 km/hr faster than Super Fast Express
        default:
            return 200;
    }
}

// Get additional fare based on train type
function getAdditionalFare(trainType) {
    switch(trainType) {
        case "Express":
            return 0; // Base fare
        case "Super Fast Express":
            return 500; // Rs. 500 more than Express
        case "Bullet Train":
            return 2000; // Rs. 1500 more than Super Fast Express (500+1500)
        default:
            return 0;
    }
}

// Generate train times (starting from 03:00, every 3 hours)
function generateTrainTimings() {
    const timings = [];
    for (let hour = 3; hour < 24; hour += 3) {
        const formattedHour = hour.toString().padStart(2, '0');
        timings.push(`${formattedHour}:00`);
    }
    // Add the first train for the next day (00:00)
    timings.push('00:00');
    return timings;
}

// Format time in 12-hour format with AM/PM
function formatTime(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Calculate arrival time based on departure time and journey duration
function calculateArrivalTime(departureTime, durationHours) {
    const [hours, minutes] = departureTime.split(':').map(Number);
    
    // Calculate total minutes for departure time
    let departureMinutes = hours * 60 + minutes;
    
    // Calculate duration in minutes
    const durationMinutes = Math.round(durationHours * 60);
    
    // Calculate arrival time in minutes
    let arrivalMinutes = departureMinutes + durationMinutes;
    
    // Calculate days elapsed
    const daysElapsed = Math.floor(arrivalMinutes / (24 * 60));
    
    // Adjust arrival minutes to be within 24 hours
    arrivalMinutes = arrivalMinutes % (24 * 60);
    
    // Convert back to hours and minutes
    const arrivalHours = Math.floor(arrivalMinutes / 60);
    const remainingMinutes = arrivalMinutes % 60;
    
    // Format arrival time
    const formattedArrivalTime = `${arrivalHours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}`;
    
    return {
        time: formattedArrivalTime,
        daysElapsed: daysElapsed
    };
}

// Function to generate train options based on route
function generateTrainOptions(fromCity, toCity, distance) {
    const trainTimings = generateTrainTimings();
    const trainOptions = [];
    
    // Calculate journey duration based on distance (200km/hr)
    const durationHours = distance / 200;
    
    // Get the current date to determine if today is Monday (for reference)
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
    const isMonday = dayOfWeek === 1;
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // How many days since last Monday
    
    // Create train names based on destination and train types
    const trainTypes = ["Express", "Super Fast Express", "Bullet Train"];
    let trainNumber = 12500; // Starting train number
    
    // Generate train options for each available time
    trainTimings.forEach((departureTime, index) => {
        // Create train name based on destination and use a different train type for each time slot
        const trainType = trainTypes[index % trainTypes.length];
        const trainName = `${toCity} ${trainType}`;
        
        // Get speed based on train type
        const trainSpeed = getTrainSpeed(trainType);
        
        // Recalculate duration based on train speed
        const adjustedDurationHours = distance / trainSpeed;
        
        // Calculate arrival time based on adjusted duration
        const adjustedArrival = calculateArrivalTime(departureTime, adjustedDurationHours);
        
        // Format arrival and departure times with AM/PM
        const formattedDepartureTime = formatTime(departureTime);
        const formattedArrivalTime = formatTime(adjustedArrival.time);
        
        // Create arrival day indicator
        let arrivalDayIndicator = '';
        if (adjustedArrival.daysElapsed === 1) {
            arrivalDayIndicator = ' (+1)';
        } else if (adjustedArrival.daysElapsed > 1) {
            arrivalDayIndicator = ` (+${adjustedArrival.daysElapsed})`;
        }
        
        // Increment train number for each train
        const currentTrainNumber = trainNumber + index;
        
        // Get additional fare for this train type
        const additionalFare = getAdditionalFare(trainType);
        
        trainOptions.push({
            name: trainName,
            number: currentTrainNumber,
            type: trainType,
            speed: trainSpeed,
            departureTime: departureTime,
            formattedDepartureTime: formattedDepartureTime,
            arrivalTime: adjustedArrival.time,
            formattedArrivalTime: formattedArrivalTime + arrivalDayIndicator,
            duration: adjustedDurationHours.toFixed(2),
            formattedDuration: adjustedArrival.daysElapsed > 0 ? 
                `${adjustedArrival.daysElapsed} day${adjustedArrival.daysElapsed > 1 ? 's' : ''} ${Math.floor(adjustedDurationHours % 24)} hr ${Math.round(((adjustedDurationHours % 24) % 1) * 60)} min` : 
                `${Math.floor(adjustedDurationHours)} hr ${Math.round((adjustedDurationHours % 1) * 60)} min`,
            daysElapsed: adjustedArrival.daysElapsed,
            additionalFare: additionalFare
        });
    });
    
    return trainOptions;
}

// Display train options
function displayTrainOptions(trainOptions) {
    const container = document.querySelector('.container');
    
    // Store original content to allow returning to the form
    const originalContent = container.innerHTML;
    sessionStorage.setItem('originalFormContent', originalContent);
    
    // Create train options content
    let trainOptionsHtml = `
        <div class="train-options-container">
            <h2>Available Trains</h2>
            <p>Select a train to continue booking</p>
            <div class="train-list">
    `;
    
    // Add each train option
    trainOptions.forEach((train, index) => {
        trainOptionsHtml += `
            <div class="train-card" data-index="${index}">
                <div class="train-header">
                    <div class="train-name">
                        <h3>${train.name}</h3>
                        <p>Train #${train.number}</p>
                    </div>
                </div>
                <div class="train-details">
                    <div class="train-time">
                        <h4>${train.formattedDepartureTime}</h4>
                        <p>Departure</p>
                    </div>
                    <div class="train-duration">
                        <p>${train.formattedDuration}</p>
                        <p><small>Speed: ${train.speed} km/hr</small></p>
                        <div class="duration-line"></div>
                    </div>
                    <div class="train-time">
                        <h4>${train.formattedArrivalTime}</h4>
                        <p>Arrival</p>
                    </div>
                </div>
                <div class="train-classes">
                    <p>Additional fare: ₹${train.additionalFare}</p>
                    <button class="select-train-btn" onclick="selectTrain(${index})">Select This Train</button>
                </div>
            </div>
        `;
    });
    
    trainOptionsHtml += `
            </div>
            <button class="btn btn-outline" onclick="backToSearch()">Back to Search</button>
        </div>
    `;
    
    // Replace form with train options
    container.innerHTML = trainOptionsHtml;
    
    // Global variable to store train options
    window.availableTrains = trainOptions;
}

// Function to calculate total price
function calculateTotal() {
    // Get form values
    const fromCity = document.getElementById('fromCity').value;
    const toCity = document.getElementById('toCity').value;
    const trainClass = document.getElementById('trainClass').value;
    const tatkal = document.getElementById('tatkal').checked;
    const numPassengers = parseInt(document.getElementById('numPassengers').value);
    const discountCategory = document.getElementById('discountCategory').value;
    const returnJourney = document.getElementById('returnJourney').checked;
    
    // Basic validation
    if (fromCity === toCity) {
        alert("From and To cities cannot be the same!");
        return;
    }
    
    if (isNaN(numPassengers) || numPassengers < 1) {
        alert("Please enter a valid number of passengers");
        return;
    }
    
    // Calculate base fare based on distance between cities
    const distances = {
        Trivandrum: { Chennai: 700, Bangalore: 840, Hyderabad: 1200, Mumbai: 1600, Delhi: 2800, Kolkata: 2300, Guwahati: 3200 },
        Chennai: { Trivandrum: 700, Bangalore: 350, Hyderabad: 630, Mumbai: 1200, Delhi: 2200, Kolkata: 1660, Guwahati: 2500 },
        Bangalore: { Trivandrum: 840, Chennai: 350, Hyderabad: 560, Mumbai: 980, Delhi: 2150, Kolkata: 1940, Guwahati: 2900 },
        Hyderabad: { Trivandrum: 1200, Chennai: 630, Bangalore: 560, Mumbai: 700, Delhi: 1580, Kolkata: 1500, Guwahati: 2300 },
        Mumbai: { Trivandrum: 1600, Chennai: 1200, Bangalore: 980, Hyderabad: 700, Delhi: 1400, Kolkata: 2000, Guwahati: 2700 },
        Delhi: { Trivandrum: 2800, Chennai: 2200, Bangalore: 2150, Hyderabad: 1580, Mumbai: 1400, Kolkata: 1450, Guwahati: 1900 },
        Kolkata: { Trivandrum: 2300, Chennai: 1660, Bangalore: 1940, Hyderabad: 1500, Mumbai: 2000, Delhi: 1450, Guwahati: 1000 },
        Guwahati: { Trivandrum: 3200, Chennai: 2500, Bangalore: 2900, Hyderabad: 2300, Mumbai: 2700, Delhi: 1900, Kolkata: 1000 }
    };
    
    // Get distance between selected cities
    let distance = 0;
    if (distances[fromCity] && distances[fromCity][toCity]) {
        distance = distances[fromCity][toCity];
    } else {
        alert("Route information not available");
        return;
    }
    
    // Base fare calculation (₹1.5 per km for first class, ₹1.2 for second, ₹0.8 for third, ₹0.4 for unreserved)
    let baseFare = 0;
    switch(trainClass) {
        case "First Class - Air Conditioned":
            baseFare = distance * 1.5;
            break;
        case "Second Class - Air Conditioned":
            baseFare = distance * 1.2;
            break;
        case "Third Class - Non AC":
            baseFare = distance * 0.8;
            break;
        case "Unreserved":
            baseFare = distance * 0.4;
            break;
    }
    
    // Get additional fare based on train type if selectedTrain exists in sessionStorage
    let additionalFare = 0;
    const selectedTrainStr = sessionStorage.getItem('selectedTrain');
    if (selectedTrainStr) {
        try {
            const selectedTrain = JSON.parse(selectedTrainStr);
            additionalFare = selectedTrain.additionalFare || 0;
        } catch (e) {
            console.error('Error parsing selected train:', e);
        }
    }
    
    // Add additional fare based on train type
    baseFare += additionalFare;
    
    // Apply tatkal charges if selected (25% extra)
    if (tatkal) {
        baseFare *= 1.25;
    }
    
    // Apply discount based on category
    let discountPercentage = 0;
    switch(discountCategory) {
        case "disabled":
        case "pregnant":
            discountPercentage = 0.5; // 50% discount
            break;
        case "ex-service":
        case "army":
            discountPercentage = 0.3; // 30% discount
            break;
        case "elder":
            discountPercentage = 0.4; // 40% discount
            break;
        case "research":
        case "school-college":
            discountPercentage = 0.35; // 35% discount
            break;
        case "gov-employee":
            discountPercentage = 0.1; // 10% discount
            break;
        case "national-sport":
            discountPercentage = 0.25; // 25% discount
            break;
        case "international-sport":
            discountPercentage = 0.45; // 45% discount
            break;
    }
    
    // Apply discount
    baseFare = baseFare * (1 - discountPercentage);
    
    // Multiply by number of passengers
    let totalFare = baseFare * numPassengers;
    
    // Double the fare for return journey
    if (returnJourney) {
        totalFare *= 2;
    }
    
    // Add booking fee
    const bookingFee = 25;
    totalFare += bookingFee;
    
    // Add GST (5%)
    const gst = totalFare * 0.05;
    const finalFare = totalFare + gst;
    
    // Display the total price with breakdown
    const totalPriceElement = document.getElementById('totalPrice');
    
    let breakdownHtml = `
        <div class="fare-breakdown">
            <h3>Fare Breakdown</h3>
            <p>Distance: ${distance} km</p>
            <p>Base Fare: ₹${baseFare.toFixed(2)} ${discountPercentage > 0 ? `(after ${discountPercentage * 100}% discount)` : ''}</p>
            <p>Number of Passengers: ${numPassengers}</p>
            ${returnJourney ? '<p>Return Journey: Yes (2x fare)</p>' : ''}
            ${tatkal ? '<p>Tatkal Booking: Yes (25% extra)</p>' : ''}
            ${additionalFare > 0 ? `<p>Additional Train Type Fare: ₹${additionalFare}</p>` : ''}
            <p>Booking Fee: ₹${bookingFee.toFixed(2)}</p>
            <p>GST (5%): ₹${gst.toFixed(2)}</p>
            <hr>
            <p class="total">Total Fare: ₹${finalFare.toFixed(2)}</p>
        </div>
    `;
    
    totalPriceElement.innerHTML = breakdownHtml;
    
    // Store the distance and fare for search results
    sessionStorage.setItem('distance', distance);
    sessionStorage.setItem('fromCity', fromCity);
    sessionStorage.setItem('toCity', toCity);
    sessionStorage.setItem('finalFare', finalFare.toFixed(2));
    
    return finalFare;
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form values
    const fromCity = document.getElementById('fromCity').value;
    const toCity = document.getElementById('toCity').value;
    const journeyDate = document.getElementById('journeyDate').value;
    const trainClass = document.getElementById('trainClass').value;
    const returnJourney = document.getElementById('returnJourney').checked;
    const returnDate = returnJourney ? document.getElementById('returnDate').value : '';
    const numPassengers = document.getElementById('numPassengers').value;
    const passengerName = document.getElementById('passengerName').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const tatkal = document.getElementById('tatkal').checked;
    const discountCategory = document.getElementById('discountCategory').value;
    const confirmation = document.getElementById('confirmation').value;
    
    // Basic validation
    if (fromCity === toCity) {
        alert("From and To cities cannot be the same!");
        return false;
    }
    
    if (!journeyDate) {
        alert("Please select a journey date!");
        return false;
    }
    
    if (returnJourney && !returnDate) {
        alert("Please select a return date!");
        return false;
    }
    
    if (returnJourney && new Date(returnDate) <= new Date(journeyDate)) {
        alert("Return date must be after journey date!");
        return false;
    }
    
    if (!numPassengers || numPassengers < 1 || numPassengers > 10) {
        alert("Please enter a valid number of passengers (1-10)!");
        return false;
    }
    
    if (!passengerName.trim()) {
        alert("Please enter passenger name!");
        return false;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert("Please enter a valid email address!");
        return false;
    }
    
    if (!mobile.match(/^\d{10}$/)) {
        alert("Please enter a valid 10-digit mobile number!");
        return false;
    }
    
    // Store user information
    sessionStorage.setItem('journeyDate', journeyDate);
    sessionStorage.setItem('trainClass', trainClass);
    sessionStorage.setItem('returnJourney', returnJourney);
    sessionStorage.setItem('returnDate', returnDate);
    sessionStorage.setItem('numPassengers', numPassengers);
    sessionStorage.setItem('passengerName', passengerName);
    sessionStorage.setItem('email', email);
    sessionStorage.setItem('mobile', mobile);
    sessionStorage.setItem('tatkal', tatkal);
    sessionStorage.setItem('discountCategory', discountCategory);
    sessionStorage.setItem('confirmation', confirmation);
    
    // Calculate fare and distance
    const distances = {
        Trivandrum: { Chennai: 700, Bangalore: 840, Hyderabad: 1200, Mumbai: 1600, Delhi: 2800, Kolkata: 2300, Guwahati: 3200 },
        Chennai: { Trivandrum: 700, Bangalore: 350, Hyderabad: 630, Mumbai: 1200, Delhi: 2200, Kolkata: 1660, Guwahati: 2500 },
        Bangalore: { Trivandrum: 840, Chennai: 350, Hyderabad: 560, Mumbai: 980, Delhi: 2150, Kolkata: 1940, Guwahati: 2900 },
        Hyderabad: { Trivandrum: 1200, Chennai: 630, Bangalore: 560, Mumbai: 700, Delhi: 1580, Kolkata: 1500, Guwahati: 2300 },
        Mumbai: { Trivandrum: 1600, Chennai: 1200, Bangalore: 980, Hyderabad: 700, Delhi: 1400, Kolkata: 2000, Guwahati: 2700 },
        Delhi: { Trivandrum: 2800, Chennai: 2200, Bangalore: 2150, Hyderabad: 1580, Mumbai: 1400, Kolkata: 1450, Guwahati: 1900 },
        Kolkata: { Trivandrum: 2300, Chennai: 1660, Bangalore: 1940, Hyderabad: 1500, Mumbai: 2000, Delhi: 1450, Guwahati: 1000 },
        Guwahati: { Trivandrum: 3200, Chennai: 2500, Bangalore: 2900, Hyderabad: 2300, Mumbai: 2700, Delhi: 1900, Kolkata: 1000 }
    };
    
    // Get distance between selected cities
    let distance = 0;
    if (distances[fromCity] && distances[fromCity][toCity]) {
        distance = distances[fromCity][toCity];
    } else {
        alert("Route information not available");
        return false;
    }
    
    // Store the distance for train generation
    sessionStorage.setItem('distance', distance);
    sessionStorage.setItem('fromCity', fromCity);
    sessionStorage.setItem('toCity', toCity);
    
    // Generate train options
    const trainOptions = generateTrainOptions(fromCity, toCity, distance);
    
    // Display train options
    displayTrainOptions(trainOptions);
    
    return true;
}

// Function to go back to search form
function backToSearch() {
    const container = document.querySelector('.container');
    const originalContent = sessionStorage.getItem('originalFormContent');
    
    if (originalContent) {
        container.innerHTML = originalContent;
        
        // Reattach event listeners
        document.getElementById('returnJourney').addEventListener('change', toggleReturnDate);
        document.getElementById('bookingForm').addEventListener('submit', handleFormSubmit);
        
        // Set min date for date inputs
        setMinDates();
        
        // Restore saved form values
        const fromCity = sessionStorage.getItem('fromCity');
        const toCity = sessionStorage.getItem('toCity');
        const journeyDate = sessionStorage.getItem('journeyDate');
        const trainClass = sessionStorage.getItem('trainClass');
        const returnJourney = sessionStorage.getItem('returnJourney');
        const returnDate = sessionStorage.getItem('returnDate');
        const numPassengers = sessionStorage.getItem('numPassengers');
        const passengerName = sessionStorage.getItem('passengerName');
        const email = sessionStorage.getItem('email');
        const mobile = sessionStorage.getItem('mobile');
        const tatkal = sessionStorage.getItem('tatkal');
        const discountCategory = sessionStorage.getItem('discountCategory');
        const confirmation = sessionStorage.getItem('confirmation');
        
        // Restore form values if available
        if (fromCity) document.getElementById('fromCity').value = fromCity;
        if (toCity) document.getElementById('toCity').value = toCity;
        if (journeyDate) document.getElementById('journeyDate').value = journeyDate;
        if (trainClass) document.getElementById('trainClass').value = trainClass;
        if (returnJourney === 'true') {
            document.getElementById('returnJourney').checked = true;
            toggleReturnDate();
        }
        if (returnDate) document.getElementById('returnDate').value = returnDate;
        if (numPassengers) document.getElementById('numPassengers').value = numPassengers;
        if (passengerName) document.getElementById('passengerName').value = passengerName;
        if (email) document.getElementById('email').value = email;
        if (mobile) document.getElementById('mobile').value = mobile;
        if (tatkal === 'true') document.getElementById('tatkal').checked = true;
        if (discountCategory) document.getElementById('discountCategory').value = discountCategory;
        if (confirmation) document.getElementById('confirmation').value = confirmation;
    } else {
        // Reload the page if original content not found
        window.location.reload();
    }
}

// Function to select a train
function selectTrain(index) {
    const selectedTrain = window.availableTrains[index];
    
    // Store selected train in sessionStorage
    sessionStorage.setItem('selectedTrain', JSON.stringify(selectedTrain));
    
    // Display passenger information form
    displayPassengerForm(selectedTrain);
}

// Function to display passenger information form
function displayPassengerForm(selectedTrain) {
    const container = document.querySelector('.container');
    
    // Get stored values
    const fromCity = sessionStorage.getItem('fromCity');
    const toCity = sessionStorage.getItem('toCity');
    const journeyDate = sessionStorage.getItem('journeyDate');
    const trainClass = sessionStorage.getItem('trainClass');
    const numPassengers = parseInt(sessionStorage.getItem('numPassengers')) || 1;
    const passengerName = sessionStorage.getItem('passengerName') || '';
    const finalFare = sessionStorage.getItem('finalFare') || calculateTotal();
    
    // Format journey date
    const formattedJourneyDate = new Date(journeyDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create passenger form content
    let passengerFormHtml = `
        <div class="passenger-form-container">
            <h2>Passenger Details</h2>
            <div class="journey-summary">
                <div class="summary-item">
                    <strong>Train:</strong> ${selectedTrain.name} (${selectedTrain.number})
                </div>
                <div class="summary-item">
                    <strong>From:</strong> ${fromCity}
                </div>
                <div class="summary-item">
                    <strong>To:</strong> ${toCity}
                </div>
                <div class="summary-item">
                    <strong>Date:</strong> ${formattedJourneyDate}
                </div>
                <div class="summary-item">
                    <strong>Class:</strong> ${trainClass}
                </div>
                <div class="summary-item">
                    <strong>Departure:</strong> ${selectedTrain.formattedDepartureTime}
                </div>
                <div class="summary-item">
                    <strong>Arrival:</strong> ${selectedTrain.formattedArrivalTime}
                </div>
            </div>
            
            <form id="passengerDetailsForm">
                <h3>Passenger Information</h3>
    `;
    
    // Add passenger input fields based on number of passengers
    for (let i = 0; i < numPassengers; i++) {
        passengerFormHtml += `
            <div class="passenger-details">
                <h4>Passenger ${i + 1}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label for="name${i}">Full Name</label>
                        <input type="text" id="name${i}" name="name${i}" value="${i === 0 ? passengerName : ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="age${i}">Age</label>
                        <input type="number" id="age${i}" name="age${i}" min="1" max="120" required>
                    </div>
                    <div class="form-group">
                        <label for="gender${i}">Gender</label>
                        <select id="gender${i}" name="gender${i}" required>
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="seatPreference${i}">Seat Preference</label>
                        <select id="seatPreference${i}" name="seatPreference${i}">
                            <option value="no-preference">No Preference</option>
                            <option value="lower">Lower Berth</option>
                            <option value="middle">Middle Berth</option>
                            <option value="upper">Upper Berth</option>
                            <option value="side-lower">Side Lower</option>
                            <option value="side-upper">Side Upper</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="id-type${i}">ID Proof Type</label>
                        <select id="id-type${i}" name="id-type${i}" required>
                            <option value="">Select ID Type</option>
                            <option value="aadhar">Aadhar Card</option>
                            <option value="pan">PAN Card</option>
                            <option value="passport">Passport</option>
                            <option value="driving">Driving License</option>
                            <option value="voter">Voter ID</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="id-number${i}">ID Number</label>
                        <input type="text" id="id-number${i}" name="id-number${i}" required>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Add contact information and action buttons
    passengerFormHtml += `
                <h3>Contact Information</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="contactEmail">Email Address</label>
                        <input type="email" id="contactEmail" name="contactEmail" value="${sessionStorage.getItem('email') || ''}" required>
                    </div>
                    <div class="form-group">
                        <label for="contactMobile">Mobile Number</label>
                        <input type="tel" id="contactMobile" name="contactMobile" value="${sessionStorage.getItem('mobile') || ''}" required>
                    </div>
                </div>
                
                <div class="fare-summary">
                    <h3>Fare Summary</h3>
                    <p>Total Fare: ₹${finalFare}</p>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="backToTrainSelection()">Back</button>
                    <button type="submit" class="btn btn-primary">Proceed to Payment</button>
                </div>
            </form>
        </div>
    `;
    
    // Replace train options with passenger form
    container.innerHTML = passengerFormHtml;
    
    // Add event listener to form
    document.getElementById('passengerDetailsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Store passenger details
        const passengers = [];
        for (let i = 0; i < numPassengers; i++) {
            passengers.push({
                name: document.getElementById(`name${i}`).value,
                age: document.getElementById(`age${i}`).value,
                gender: document.getElementById(`gender${i}`).value,
                seatPreference: document.getElementById(`seatPreference${i}`).value,
                idType: document.getElementById(`id-type${i}`).value,
                idNumber: document.getElementById(`id-number${i}`).value
            });
        }
        
        // Store contact information
        sessionStorage.setItem('contactEmail', document.getElementById('contactEmail').value);
        sessionStorage.setItem('contactMobile', document.getElementById('contactMobile').value);
        
        // Store passengers
        sessionStorage.setItem('passengers', JSON.stringify(passengers));
        
        // Proceed to payment
        displayPaymentForm();
    });
}

// Function to go back to train selection
function backToTrainSelection() {
    // Get train options
    const trainOptions = window.availableTrains || JSON.parse(sessionStorage.getItem('trainOptions'));
    
    if (trainOptions) {
        // Display train options
        displayTrainOptions(trainOptions);
    } else {
        // If train options not available, go back to search
        backToSearch();
    }
}

// Function to display payment form
function displayPaymentForm() {
    const container = document.querySelector('.container');
    
    // Get selected train
    const selectedTrain = JSON.parse(sessionStorage.getItem('selectedTrain'));
    
    // Get stored values
    const fromCity = sessionStorage.getItem('fromCity');
    const toCity = sessionStorage.getItem('toCity');
    const journeyDate = sessionStorage.getItem('journeyDate');
    const trainClass = sessionStorage.getItem('trainClass');
    const finalFare = sessionStorage.getItem('finalFare');
    
    // Format journey date
    const formattedJourneyDate = new Date(journeyDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Create payment form content
    let paymentFormHtml = `
        <div class="payment-form-container">
            <h2>Payment</h2>
            <div class="journey-summary">
                <div class="summary-item">
                    <strong>Train:</strong> ${selectedTrain.name} (${selectedTrain.number})
                </div>
                <div class="summary-item">
                    <strong>From:</strong> ${fromCity}
                </div>
                <div class="summary-item">
                    <strong>To:</strong> ${toCity}
                </div>
                <div class="summary-item">
                    <strong>Date:</strong> ${formattedJourneyDate}
                </div>
                <div class="summary-item">
                    <strong>Class:</strong> ${trainClass}
                </div>
                <div class="summary-item">
                    <strong>Total Fare:</strong> ₹${finalFare}
                </div>
            </div>
            
            <div class="payment-options">
                <h3>Select Payment Method</h3>
                <div class="payment-tabs">
                    <div class="payment-tab active" data-tab="card">Credit/Debit Card</div>
                    <div class="payment-tab" data-tab="upi">UPI</div>
                    <div class="payment-tab" data-tab="netbanking">Net Banking</div>
                </div>
                
                <div class="payment-tab-content active" id="card-tab">
                    <form id="card-payment-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-number">Card Number</label>
                                <input type="text" id="card-number" name="card-number" placeholder="1234 5678 9012 3456" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="card-name">Name on Card</label>
                                <input type="text" id="card-name" name="card-name" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="expiry-month">Expiry Date</label>
                                <div class="expiry-container">
                                    <select id="expiry-month" name="expiry-month" required>
                                        <option value="">MM</option>
                                        <option value="01">01</option>
                                        <option value="02">02</option>
                                        <option value="03">03</option>
                                        <option value="04">04</option>
                                        <option value="05">05</option>
                                        <option value="06">06</option>
                                        <option value="07">07</option>
                                        <option value="08">08</option>
                                        <option value="09">09</option>
                                        <option value="10">10</option>
                                        <option value="11">11</option>
                                        <option value="12">12</option>
                                    </select>
                                    <select id="expiry-year" name="expiry-year" required>
                                        <option value="">YYYY</option>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                        <option value="2028">2028</option>
                                        <option value="2029">2029</option>
                                        <option value="2030">2030</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="cvv">CVV</label>
                                <input type="text" id="cvv" name="cvv" placeholder="123" required>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="payment-tab-content" id="upi-tab">
                    <form id="upi-payment-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="upi-id">UPI ID</label>
                                <input type="text" id="upi-id" name="upi-id" placeholder="username@upi" required>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div class="payment-tab-content" id="netbanking-tab">
                    <form id="netbanking-payment-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Select Bank</label>
                                <div class="bank-options">
                                    <div class="bank-option" data-bank="sbi">SBI</div>
                                    <div class="bank-option" data-bank="hdfc">HDFC</div>
                                    <div class="bank-option" data-bank="icici">ICICI</div>
                                    <div class="bank-option" data-bank="axis">Axis</div>
                                </div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="other-bank">Other Banks</label>
                                <select id="other-bank" name="other-bank">
                                    <option value="">Select Bank</option>
                                    <option value="boi">Bank of India</option>
                                    <option value="bob">Bank of Baroda</option>
                                    <option value="canara">Canara Bank</option>
                                    <option value="pnb">Punjab National Bank</option>
                                    <option value="idbi">IDBI Bank</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-outline" onclick="backToPassengerDetails()">Back</button>
                <button type="button" class="btn btn-primary" onclick="processPayment()">Make Payment</button>
            </div>
        </div>
    `;
    
    // Replace passenger form with payment form
    container.innerHTML = paymentFormHtml;
    
    // Add event listeners to payment tabs
    document.querySelectorAll('.payment-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.payment-tab').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab content
            document.querySelectorAll('.payment-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show tab content for clicked tab
            const tabContentId = this.getAttribute('data-tab') + '-tab';
            document.getElementById(tabContentId).classList.add('active');
        });
    });
    
    // Add event listeners to bank options
    document.querySelectorAll('.bank-option').forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected class from all options
            document.querySelectorAll('.bank-option').forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
        });
    });
}

// Function to go back to passenger details
function backToPassengerDetails() {
    // Get selected train
    const selectedTrain = JSON.parse(sessionStorage.getItem('selectedTrain'));
    
    // Display passenger form
    displayPassengerForm(selectedTrain);
}

// Function to process payment
function processPayment() {
    // Get active payment tab
    const activeTab = document.querySelector('.payment-tab.active');
    
    if (!activeTab) {
        alert('Please select a payment method');
        return;
    }
    
    const tabId = activeTab.getAttribute('data-tab');
    let isValid = true;
    let paymentMethod = '';
    
    // Validate based on active payment method
    if (tabId === 'card') {
        const cardNumber = document.getElementById('card-number');
        const cardName = document.getElementById('card-name');
        const expiryMonth = document.getElementById('expiry-month');
        const expiryYear = document.getElementById('expiry-year');
        const cvv = document.getElementById('cvv');
        
        if (!cardNumber.value.trim() || !cardName.value.trim() || !expiryMonth.value || !expiryYear.value || !cvv.value.trim()) {
            isValid = false;
            alert('Please fill all required fields');
        } else {
            paymentMethod = 'Credit/Debit Card';
        }
    } else if (tabId === 'upi') {
        const upiId = document.getElementById('upi-id');
        
        if (!upiId.value.trim()) {
            isValid = false;
            alert('Please enter your UPI ID');
        } else {
            paymentMethod = 'UPI';
        }
    } else if (tabId === 'netbanking') {
        const selectedBank = document.querySelector('.bank-option.selected');
        const otherBank = document.getElementById('other-bank').value;
        
        if (!selectedBank && !otherBank) {
            isValid = false;
            alert('Please select a bank');
        } else {
            paymentMethod = 'Net Banking';
        }
    }
    
    if (isValid) {
        // Store payment method
        sessionStorage.setItem('paymentMethod', paymentMethod);
        
        // Show processing animation
        showProcessingPayment();
        
        // Simulate payment processing delay
        setTimeout(() => {
            // Display booking confirmation
            displayBookingConfirmation();
        }, 2000);
    }
}

// Function to show payment processing animation
function showProcessingPayment() {
    const container = document.querySelector('.container');
    
    // Create processing content
    const processingHtml = `
        <div class="processing-container">
            <div class="loader"></div>
            <h2>Processing Payment</h2>
            <p>Please do not refresh or close this page...</p>
        </div>
    `;
    
    // Add CSS for loader
    const style = document.createElement('style');
    style.textContent = `
        .processing-container {
            text-align: center;
            padding: 50px 20px;
        }
        
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #007bff;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    // Replace payment form with processing animation
    container.innerHTML = processingHtml;
}

// Function to display booking confirmation
function displayBookingConfirmation() {
    const container = document.querySelector('.container');
    
    // Get stored data
    const selectedTrain = JSON.parse(sessionStorage.getItem('selectedTrain'));
    const fromCity = sessionStorage.getItem('fromCity');
    const toCity = sessionStorage.getItem('toCity');
    const journeyDate = sessionStorage.getItem('journeyDate');
    const trainClass = sessionStorage.getItem('trainClass');
    const paymentMethod = sessionStorage.getItem('paymentMethod');
    const finalFare = sessionStorage.getItem('finalFare');
    const passengers = JSON.parse(sessionStorage.getItem('passengers'));
    
    // Format journey date
    const formattedJourneyDate = new Date(journeyDate).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    
    // Generate PNR and ticket number
    const pnr = '2' + Math.floor(Math.random() * 9000000000 + 1000000000);
    const ticketNumber = 'T' + Math.floor(Math.random() * 900000 + 100000);
    
    // Generate seat numbers
    const coaches = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10'];
    const coach = coaches[Math.floor(Math.random() * coaches.length)];
    
    const seatTypes = ['Lower', 'Middle', 'Upper', 'Side Lower', 'Side Upper'];
    const seats = [];
    
    for (let i = 0; i < passengers.length; i++) {
        const seatNumber = Math.floor(Math.random() * 72) + 1;
        const seatTypeIndex = passengers[i].seatPreference !== 'no-preference'
            ? seatTypes.findIndex(type => type.toLowerCase() === passengers[i].seatPreference.replace('-', ' '))
            : Math.floor(Math.random() * seatTypes.length);
        const seatType = seatTypes[seatTypeIndex >= 0 ? seatTypeIndex : 0];
        
        seats.push({
            coach: coach,
            number: seatNumber,
            type: seatType
        });
    }
    
    // Create confirmation content
    let confirmationHtml = `
        <div class="confirmation-container">
            <div class="booking-success">
                <div class="success-icon">✓</div>
                <h2>Booking Confirmed!</h2>
                <p>Your ticket has been booked successfully</p>
            </div>
            
            <div class="ticket">
                <div class="ticket-header">
                    <h3>Chugg.com E-Ticket</h3>
                    <p>PNR: ${pnr}</p>
                </div>
                
                <div class="ticket-details">
                    <div class="detail-row">
                        <div class="detail-label">Train:</div>
                        <div class="detail-value">${selectedTrain.name} (${selectedTrain.number})</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">From:</div>
                        <div class="detail-value">${fromCity}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">To:</div>
                        <div class="detail-value">${toCity}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Date:</div>
                        <div class="detail-value">${formattedJourneyDate}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Class:</div>
                        <div class="detail-value">${trainClass}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Departure:</div>
                        <div class="detail-value">${selectedTrain.formattedDepartureTime} (On time)</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Arrival:</div>
                        <div class="detail-value">${selectedTrain.formattedArrivalTime} (On time)</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Duration:</div>
                        <div class="detail-value">${selectedTrain.formattedDuration}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Train Type:</div>
                        <div class="detail-value">${selectedTrain.type} (${selectedTrain.speed} km/hr)</div>
                    </div>
                </div>
                
                <div class="passenger-details">
                    <h4>Passenger Details</h4>
                    <table class="passenger-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Age</th>
                                <th>Gender</th>
                                <th>Seat</th>
                            </tr>
                        </thead>
                        <tbody>
    `;
    
    // Add passenger rows
    passengers.forEach((passenger, index) => {
        confirmationHtml += `
            <tr>
                <td>${passenger.name}</td>
                <td>${passenger.age}</td>
                <td>${passenger.gender === 'male' ? 'Male' : passenger.gender === 'female' ? 'Female' : 'Other'}</td>
                <td>${seats[index].coach} - ${seats[index].number} (${seats[index].type})</td>
            </tr>
        `;
    });
    
    confirmationHtml += `
                        </tbody>
                    </table>
                </div>
                
                <div class="payment-details">
                    <h4>Payment Details</h4>
                    <div class="detail-row">
                        <div class="detail-label">Payment Method:</div>
                        <div class="detail-value">${paymentMethod}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Total Fare:</div>
                        <div class="detail-value">₹${finalFare}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Ticket Number:</div>
                        <div class="detail-value">${ticketNumber}</div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-label">Booking Date:</div>
                        <div class="detail-value">${new Date().toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}</div>
                    </div>
                </div>
                
                <div class="ticket-footer">
                    <p>Thank you for choosing Chugg.com!</p>
                    <p>Please carry a valid ID proof during the journey.</p>
                </div>
            </div>
            
            <div class="ticket-actions">
                <button class="btn btn-outline" onclick="printTicket()">Print Ticket</button>
                <button class="btn btn-primary" onclick="bookAnotherTicket()">Book Another Ticket</button>
            </div>
        </div>
    `;
    
    // Add CSS for confirmation page
    const style = document.createElement('style');
    style.textContent = `
        .booking-success {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .success-icon {
            display: inline-block;
            width: 60px;
            height: 60px;
            background-color: #28a745;
            color: white;
            border-radius: 50%;
            font-size: 40px;
            line-height: 60px;
            margin-bottom: 15px;
        }
        
        .ticket {
            border: 2px solid #007bff;
            border-radius: 10px;
            margin-bottom: 30px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 120px;
        }
        
        .detail-value {
            flex: 1;
        }
        
        .passenger-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        
        .passenger-table th, .passenger-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        
        .passenger-table th {
            background-color: #f8f9fa;
        }
        
        .passenger-details, .payment-details {
            padding: 0 20px;
            margin: 20px 0;
        }
        
        .passenger-details h4, .payment-details h4 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        
        .ticket-actions {
            display: flex;
            gap: 15px;
        }
        
        @media print {
            .ticket-actions {
                display: none;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Replace processing animation with confirmation
    container.innerHTML = confirmationHtml;
}

// Function to print ticket
function printTicket() {
    window.print();
}

// Function to book another ticket
function bookAnotherTicket() {
    // Clear session storage
    sessionStorage.clear();
    
    // Reload the page
    window.location.reload();
}

// Function to reset form
function resetForm() {
    document.getElementById('bookingForm').reset();
    document.getElementById('totalPrice').innerHTML = '';
    
    // Clear session storage
    sessionStorage.clear();
    
    // Set min date for date inputs
    setMinDates();
}

// Function to set minimum dates for date inputs
function setMinDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Format dates as YYYY-MM-DD for date inputs
    const todayFormatted = today.toISOString().split('T')[0];
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    
    // Set min and default values for journey date
    const journeyDateInput = document.getElementById('journeyDate');
    if (journeyDateInput) {
        journeyDateInput.min = todayFormatted;
        if (!journeyDateInput.value) {
            journeyDateInput.value = tomorrowFormatted;
        }
    }
    
    // Set min value for return date
    const returnDateInput = document.getElementById('returnDate');
    if (returnDateInput && journeyDateInput) {
        returnDateInput.min = journeyDateInput.value;
    }
}

// Initialize when document is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set event listeners
    const returnJourneyCheckbox = document.getElementById('returnJourney');
    if (returnJourneyCheckbox) {
        returnJourneyCheckbox.addEventListener('change', toggleReturnDate);
    }
    
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Set journey date to update return date min value when changed
    const journeyDateInput = document.getElementById('journeyDate');
    if (journeyDateInput) {
        journeyDateInput.addEventListener('change', function() {
            const returnDateInput = document.getElementById('returnDate');
            if (returnDateInput) {
                returnDateInput.min = this.value;
            }
        });
    }
    
    // Initialize date inputs
    setMinDates();
    
    // Clear any previous session data
    sessionStorage.clear();
});