// if city not in supabase db, add to db
import React from 'react'

async function AddUserCity(city) {
    const { Place } = await google.maps.importLibrary("places");

    const request = {
        textQuery: ('Tennis Courts in' + city),
        fields: ['displayName', 'location', 'postalAddress', 'rating', 'reviews'],
        isOpenNow: true,
        language: 'en-US',
        maxResultCount: 6,
        minRating: 3.5,
        region: 'us',
        useStrictTypeFiltering: false,
    };
    //@ts-ignore
    const { places } = await Place.searchByText(request);

    const scrapeReviews = (reviews) => {
        let maxCourts = 0;

        reviews.forEach((review) => {
            const reviewText = review.text;
            // Match number followed by "tennis courts" or "courts"
            const regex = /(\d+)\s+(tennis\s+)?courts/g;
            let match;

            // Use the regular expression to find all matches
            while ((match = regex.exec(reviewText)) !== null) {
                const number = parseInt(match[1]);  // The number found before "courts"
                maxCourts = Math.max(maxCourts, number);
            }
        });

        return maxCourts;
    }

    const names = [];
    const addresses = [];
    const ratings = [];
    const numCourts = [];
    places.forEach((place) => {
        names.push(place['Eg']['displayName']);
        addresses.push(place['Eg']['postalAddress']['addressLines'][0]);
        ratings.push(place['Eg']['rating']);

        numCourts.push(scrapeReviews(place['Eg']['reviews']));
    })
    for (let i = 0; i < numCourts.length; i++) {
        if (numCourts[i] == 0){
            numCourts[i] = null;
        }
    }

    return { names, addresses, ratings, numCourts };
}

export default AddUserCity;


