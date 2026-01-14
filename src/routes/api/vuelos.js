
import express from 'express';
import Amadeus from 'amadeus';

const vuelosRouter = express.Router();

// Initialize Amadeus client
// It will use mock mode if keys are missing or invalid in strict production apps, 
// but here we handle the "no key" error gracefully in the catch block.
let amadeus;
if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
    amadeus = new Amadeus({
        clientId: process.env.AMADEUS_CLIENT_ID,
        clientSecret: process.env.AMADEUS_CLIENT_SECRET
    });
}

vuelosRouter.get('/', async (req, res) => {
    const { origin, destination, date, passengers } = req.query;

    if (!origin || !destination || !date) {
        return res.status(400).json({ message: 'Missing required parameters: origin, destination, date' });
    }

    // Mock data for fallback
    const mockFlights = [
        {
            id: 'mock-1',
            price: { grandTotal: '150.00', currency: 'USD' },
            itineraries: [{
                duration: 'PT2H30M',
                segments: [{
                    departure: { iataCode: 'MOCK_ORG', at: `${date}T10:00:00` },
                    arrival: { iataCode: 'MOCK_DST', at: `${date}T12:30:00` },
                    carrierCode: 'MK',
                    number: '101'
                }]
            }],
            travelerPricings: [{ travelerType: 'ADULT', price: { total: '150.00' } }]
        },
        {
            id: 'mock-2',
            price: { grandTotal: '280.50', currency: 'USD' },
            itineraries: [{
                duration: 'PT4H15M',
                segments: [{
                    departure: { iataCode: 'MOCK_ORG', at: `${date}T15:00:00` },
                    arrival: { iataCode: 'MOCK_DST', at: `${date}T19:15:00` },
                    carrierCode: 'MK',
                    number: '202'
                }]
            }],
            travelerPricings: [{ travelerType: 'ADULT', price: { total: '280.50' } }]
        }
    ];

    if (!amadeus) {
        console.warn("Amadeus keys not found. returning mock data.");
        // Simulate a slight delay for realism
        await new Promise(r => setTimeout(r, 1000));
        return res.json({ data: mockFlights, warning: "Showing mock data. Configure AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET to see real flights." });
    }

    try {
        // Find IATA codes for cities (simplification: assuming origin/dest are already IATA or city names)
        // In a real app, you'd search for locations first. 
        // For now, let's assume the frontend sends city names and we try to search locations or use them directly if they look like IATA.


        // Sandbox environment often fails to resolve cities by name, so we use a static map for known seed data.
        const CITY_CODES = {
            'buenos aires': 'EZE',
            'cordoba': 'COR', // Amadeus might use COR or ODB. COR is common.
            'paris': 'PAR',
            'dubai': 'DXB',
            'madrid': 'MAD',
            'london': 'LON',
            'new york': 'NYC',
            'rome': 'ROM',
            'tokyo': 'TYO',
            'barcelona': 'BCN',
            'miami': 'MIA',
            'rio de janeiro': 'GIG',
            'sao paulo': 'GRU',
            'santiago': 'SCL',
            'lima': 'LIM',
            'cancun': 'CUN'
        };

        let originCode = CITY_CODES[origin.toLowerCase()] || origin;
        let destCode = CITY_CODES[destination.toLowerCase()] || destination;

        // Simple heuristic: if length > 3 AND not in our map, search for IATA
        if (originCode.length > 3) {
            try {
                const response = await amadeus.referenceData.locations.get({
                    keyword: origin.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    subType: 'CITY'
                });
                if (response.data.length > 0) originCode = response.data[0].iataCode;
            } catch (e) {
                console.log("Could not resolve origin:", origin);
            }
        }

        if (destCode.length > 3) {
            try {
                const response = await amadeus.referenceData.locations.get({
                    keyword: destination.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
                    subType: 'CITY'
                });
                if (response.data.length > 0) destCode = response.data[0].iataCode;
            } catch (e) {
                console.log("Could not resolve destination:", destination);
            }
        }

        // Ensure date is not in the past (simple check)
        const today = new Date().toISOString().split('T')[0];
        const searchDate = date < today ? today : date;

        console.log(`Searching flights from ${originCode} to ${destCode} on ${searchDate}`);

        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: originCode,
            destinationLocationCode: destCode,
            departureDate: searchDate,
            adults: passengers || 1,
            max: 10
        });

        res.json(response.data);

    } catch (error) {
        console.error("Amadeus API error:", error);
        // Fallback to mock data on error so the UI still shows something
        res.json({ data: mockFlights, warning: "Error fetching real flights (check keys/quota). Showing mock data.", error: error.message });
    }
});

export default vuelosRouter;
