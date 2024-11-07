import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import cities from "./data/cities.json";
import activities from "./data/activities.json";
import travelDurations from "./data/travelDurations.json";
import "./App.css";

const calculateDaysBetween = (start, end) => {
    if (!start || !end) return null;
    const timeDiff = Math.abs(end - start);
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

function App() {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [startCity, setStartCity] = useState("");
    const [endCity, setEndCity] = useState("");
    const [route, setRoute] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState({});
    const [addCityIndex, setAddCityIndex] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const totalDays = calculateDaysBetween(startDate, endDate);
    const totalCities = 2 + route.length; // Start city + end city + intermediate stops
    const daysPerCity = totalDays && totalCities > 0 ? (totalDays / totalCities).toFixed(1) : 0;

    // Check if start and end cities are selected
    const isDoneButtonVisible = startCity && endCity;

    const getTotalActivityDurationForCity = (cityId) => {
        const selectedActivityIds = selectedActivities[cityId] || [];
        return activities
            .filter((activity) => selectedActivityIds.includes(activity.id))
            .reduce((total, activity) => total + activity.duration, 0);
    };
    

    // Calculate total travel duration
    const calculateTotalDuration = () => {
        let totalDuration = 0;
        const cityIds = [startCity, ...route.map((r) => r.cityId), endCity];
        for (let i = 0; i < cityIds.length - 1; i++) {
            const duration = getTravelDurationBetweenCities(cityIds[i], cityIds[i + 1]);
            totalDuration += duration || 0;
        }
        return totalDuration;
    };

    // Handle opening and closing of the popup
    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    // Utility function to check if a city is already selected
    const isCityAlreadySelected = (cityId) => {
        return (
            startCity === cityId ||
            endCity === cityId ||
            route.some((routeItem) => routeItem.cityId === cityId)
        );
    };

    // Update start city with validation
    const handleStartCityChange = (e) => {
        const cityId = e.target.value;
        if (isCityAlreadySelected(cityId)) {
            alert("City is already selected. Please choose a different city.");
            return;
        }
        setStartCity(cityId);
    };

    // Update end city with validation
    const handleEndCityChange = (e) => {
        const cityId = e.target.value;
        if (isCityAlreadySelected(cityId)) {
            alert("City is already selected. Please choose a different city.");
            return;
        }
        setEndCity(cityId);
    };

    // Trigger adding a new city at a specific index by setting the state
    const initiateAddCity = (index) => {
        setAddCityIndex(index); // Set the index where the city will be added
    };

    // Handle intermediate city selection from dropdown
    const handleIntermediateCityChange = (e) => {
        const cityId = e.target.value;
        if (!cityId) return;

        const newRoute = [...route];
        newRoute.splice(addCityIndex, 0, { id: `stop-${Date.now()}`, cityId }); // Insert the city at the specified index
        setRoute(newRoute);
        setAddCityIndex(null); // Reset the index for adding cities
    };

    // Remove a city from the route
    const handleRemoveCity = (index) => {
        const newRoute = [...route];
        newRoute.splice(index, 1); // Remove the city at the specified index
        setRoute(newRoute);
    };

    // Move a city up in the route
    const handleMoveCityUp = (index) => {
        if (index === 0) return; // Already at the top
        const newRoute = [...route];
        [newRoute[index - 1], newRoute[index]] = [newRoute[index], newRoute[index - 1]]; // Swap with the previous city
        setRoute(newRoute);
    };

    // Move a city down in the route
    const handleMoveCityDown = (index) => {
        if (index === route.length - 1) return; // Already at the bottom
        const newRoute = [...route];
        [newRoute[index], newRoute[index + 1]] = [newRoute[index + 1], newRoute[index]]; // Swap with the next city
        setRoute(newRoute);
    };

    // Get activities for a specific city
    const getActivitiesForCity = (cityId) => {
        return activities.filter(
            (activity) => activity.cityId === parseInt(cityId, 10)
        );
    };

    // Handle activity selection for each city
    const toggleActivity = (cityId, activityId) => {
        setSelectedActivities((prev) => {
            const updatedActivities = new Set(prev[cityId] || []);
            if (updatedActivities.has(activityId)) {
                updatedActivities.delete(activityId);
            } else {
                updatedActivities.add(activityId);
            }
            return { ...prev, [cityId]: Array.from(updatedActivities) };
        });
    };

    // Get selected activities for a specific city
    const getSelectedActivitiesForCity = (cityId) => {
        const selectedActivityIds = selectedActivities[cityId] || [];
        return activities.filter((activity) => selectedActivityIds.includes(activity.id));
    };
    
    // Calculate travel duration between cities
    const getTravelDurationBetweenCities = (city1Id, city2Id) => {
        if (!city1Id || !city2Id) return null;
        const key = `${Math.min(city1Id, city2Id)}-${Math.max(city1Id, city2Id)}`;
        return travelDurations[key] || "Duration not available";
    };

    // Handle end date with validation and reset if invalid
    const handleEndDateChange = (date) => {
        if (startDate && date < startDate) {
            alert("End date cannot be before start date.");
            setEndDate(null);
            return;
        }
        setEndDate(date);
    };

    return (
        <div className="app">
            <h1>{totalDays ? `${totalDays} Day ` : ""}Travel Planner</h1>

            {/* Done Button */}
            {isDoneButtonVisible && (
                <button className="done-button" onClick={togglePopup}>
                Done
                </button>
            )}
            

            {/* Popup */}
            {isPopupOpen && (
                <div className="popup-overlay" onClick={togglePopup}>
                <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                    <h2>Travel Summary</h2>
                    <ul className="summary-list">
                    <li>
                        <strong>Start City:</strong> {cities.find(c => c.id === parseInt(startCity))?.name}
                        <ul>
                        {getSelectedActivitiesForCity(startCity).map(activity => (
                            <li key={activity.id}>
                            {activity.name} ({activity.duration} hours)
                            </li>
                        ))}
                        </ul>
                    </li>

                    {route.map((r, index) => (
                        <li key={r.id}>
                        <strong>Stop {index + 1}:</strong> {cities.find(c => c.id === parseInt(r.cityId))?.name}
                        <ul>
                            {getSelectedActivitiesForCity(r.cityId).map(activity => (
                            <li key={activity.id}>
                                {activity.name} ({activity.duration} hours)
                            </li>
                            ))}
                        </ul>
                        </li>
                    ))}

                    <li>
                        <strong>End City:</strong> {cities.find(c => c.id === parseInt(endCity))?.name}
                        <ul>
                        {getSelectedActivitiesForCity(endCity).map(activity => (
                            <li key={activity.id}>
                            {activity.name} ({activity.duration} hours)
                            </li>
                        ))}
                        </ul>
                    </li>
                    </ul>
                    <p><strong>Estimated Travel Duration:</strong> {calculateTotalDuration()} hours</p>
                    <button className="close-button" onClick={togglePopup}>Close</button>
                </div>
                </div>
            )}    
            {/* Travel Dates Section */}
            <div className="travel-dates">
                <div className="form-group-inline">
                    <label htmlFor="start-date">Start Date: </label>
                    <DatePicker
                        id="start-date"
                        selected={startDate}
                        dateFormat="dd/MM/yyyy"
                        onChange={(date) => setStartDate(date)}
                        placeholderText="Select start date"
                    />
                </div>
                <div className="form-group-inline">
                    <label htmlFor="end-date">End Date: </label>
                    <DatePicker
                        id="end-date"
                        selected={endDate}
                        dateFormat="dd/MM/yyyy"
                        onChange={handleEndDateChange}
                        placeholderText="Select end date"
                    />
                </div>
            </div>

            {/* Itinerary Section */}
            <div className="itinerary">
                <div className="city-row">
                    {/* Start City Card */}
                    <div className="city-card">
                        {startCity && startDate && endDate && (
                            <div className="days-per-city">
                                {daysPerCity} {daysPerCity === "1.0" ? "Day" : "Days"}
                            </div>
                        )}
                        <h3>Start City</h3>
                        <label htmlFor="start-city">Start City: </label>
                        <select id="start-city" value={startCity} onChange={handleStartCityChange} aria-label="Start City">
                            <option value="">--Select Start City--</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id} disabled={isCityAlreadySelected(city.id)}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        {startCity && (
                            <>
                                <ul className="activities-list">
                                    {getActivitiesForCity(startCity).map((activity) => (
                                        <li key={activity.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedActivities[startCity]?.includes(activity.id) || false}
                                                    onChange={() => toggleActivity(startCity, activity.id)}
                                                />
                                                {activity.name} ({activity.duration} hours)
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                                {/* Only show total-activity-duration if a city is selected */}
                                <div className="total-activity-duration">
                                    Activity Duration: {getTotalActivityDurationForCity(startCity)} hrs
                                </div>
                            </>
                        )}
                        
                    </div>

                    {/* Initial Duration Line Between Start and End City */}
                    {startCity && endCity && route.length === 0 && (
                        <div className="duration-column">
                            <div className="duration-line">
                                <span className="duration-label">{getTravelDurationBetweenCities(startCity, endCity)} hours</span>
                            </div>
                            <div className="add-city-container">
                                <select
                                    onChange={(e) => handleIntermediateCityChange(e)}
                                    aria-label="Add Intermediate City"
                                >
                                    <option value="">--Add City--</option>
                                    {cities
                                        .filter((city) => !isCityAlreadySelected(city.id))
                                        .map((city) => (
                                            <option key={city.id} value={city.id}>
                                                {city.name}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    )}

                    {/* Intermediate Cities and Durations */}
                    {route.map((routeItem, index) => {
                        const { cityId } = routeItem;
                        const previousCityId = index === 0 ? startCity : route[index - 1].cityId;
                        const travelDuration = previousCityId && cityId ? getTravelDurationBetweenCities(previousCityId, cityId) : null;

                        return (
                            <React.Fragment key={routeItem.id}>
                                {/* Duration Line between previous city and current intermediate city */}
                                {previousCityId && cityId && (
                                    <div className="duration-column">
                                        <div className="duration-line">
                                            <span className="duration-label">{travelDuration} hours</span>
                                        </div>
                                        <div className="add-city-container">
                                            {addCityIndex === index ? (
                                                <select
                                                    onChange={handleIntermediateCityChange}
                                                    aria-label="Add Intermediate City"
                                                >
                                                    <option value="">--Add City--</option>
                                                    {cities
                                                        .filter((city) => !isCityAlreadySelected(city.id))
                                                        .map((city) => (
                                                            <option key={city.id} value={city.id}>
                                                                {city.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            ) : (
                                                <button className="add-city-button" onClick={() => initiateAddCity(index)}>
                                                    Add City
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Intermediate City Card with Remove and Move Options */}
                                <div className="city-card">
                                    {routeItem.cityId && startDate && endDate && (
                                        <div className="days-per-city">
                                            {daysPerCity} {daysPerCity === "1.0" ? "Day" : "Days"}
                                        </div>
                                    )}
                                    <h3>Stop {index + 1}</h3>
                                    <h3>{cities.find((c) => c.id === parseInt(cityId, 10))?.name}</h3>
                                    <ul className="activities-list">
                                        {getActivitiesForCity(cityId).map((activity) => (
                                            <>
                                                <li key={activity.id}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedActivities[cityId]?.includes(activity.id) || false}
                                                        onChange={() => toggleActivity(cityId, activity.id)}
                                                    />
                                                    {activity.name} ({activity.duration} hours)
                                                </label>
                                            </li>
                                                
                                            <div className="total-activity-duration">
                                                Activity Duration: {getTotalActivityDurationForCity(routeItem.cityId)} hrs
                                            </div>
                                            </>

                                        ))}
                                    </ul>
                                    <div className="city-actions">
                                        <button onClick={() => handleMoveCityUp(index)} disabled={index === 0}>Move Up</button>
                                        <button onClick={() => handleMoveCityDown(index)} disabled={index === route.length - 1}>Move Down</button>
                                        <button onClick={() => handleRemoveCity(index)}>Remove</button>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}

                    {/* Duration Line Between Last Intermediate Stop and End City */}
                    {route.length > 0 && endCity && (
                        <div className="duration-column">
                            <div className="duration-line">
                                <span className="duration-label">{getTravelDurationBetweenCities(route[route.length - 1].cityId, endCity)} hours</span>
                            </div>
                            <div className="add-city-container">
                                {addCityIndex === route.length ? (
                                    <select
                                        onChange={handleIntermediateCityChange}
                                        aria-label="Add Intermediate City"
                                    >
                                        <option value="">--Add City--</option>
                                        {cities
                                            .filter((city) => !isCityAlreadySelected(city.id))
                                            .map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    <button className="add-city-button" onClick={() => initiateAddCity(route.length)}>
                                        Add City
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* End City Card */}
                    <div className="city-card">
                        {endCity && startDate && endDate && (
                            <div className="days-per-city">
                                {daysPerCity} {daysPerCity === "1.0" ? "Day" : "Days"}
                            </div>
                        )}
                        <h3>End City</h3>
                        <label htmlFor="end-city">End City:</label>
                        <select id="end-city" value={endCity} onChange={handleEndCityChange} aria-label="End City">
                            <option value="">--Select End City--</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id} disabled={isCityAlreadySelected(city.id)}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                        {endCity && (
                            <>
                                <ul className="activities-list">
                                    {getActivitiesForCity(endCity).map((activity) => (
                                        <li key={activity.id}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedActivities[endCity]?.includes(activity.id) || false}
                                                    onChange={() => toggleActivity(endCity, activity.id)}
                                                />
                                                {activity.name} ({activity.duration} hours)
                                            </label>
                                        </li>
                                    ))}
                                </ul>
                            
                                <div className="total-activity-duration">
                                    Activity Duration: {getTotalActivityDurationForCity(endCity)} hrs
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
