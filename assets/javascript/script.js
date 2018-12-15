// Testing basic API call, check console for results
// $.ajax({
//     url: "https://api.petfinder.com/pet.find?key=7dc1511d0faaadd24a44d60d637a14d8&location=44060&output=full&format=json" + "&callback=?",
//     type: "GET",
//     dataType: "json"
// }).then((response) => {
//     console.log(response);
// }).fail((error) => {
//     console.log("Failure to get API data", error);
// });



// $.ajax({
//     url: "https://api.petfinder.com/shelter.get?key=7dc1511d0faaadd24a44d60d637a14d8&id=OH500&format=json" + "&callback=?",
//     type: "GET",
//     dataType: "json"
// }).then((response) => {
//     console.log(response);
// }).fail((error) => {
//     console.log("Failure to get API data", error);
// });

$(document).ready(() => {
    $("#search-pets").on("click", (event) => {
        event.preventDefault();
        const zipcode = $("#input-zip-code").val().trim();
        const petType = $("#select-pet").val().trim();
        console.log(zipcode, petType);
        searchPets(zipcode, petType, 10);
        $("#input-zip-code").val("");
        $("#select-pet").val("");
    });
});

function searchPets(zip, type, count, offset) {
    let queryURL = "https://api.petfinder.com/pet.find?key=7dc1511d0faaadd24a44d60d637a14d8"
    queryURL += "&location=" + zip;
    if(type !== "any") {
        queryURL += "&animal=" + type;
    }
    queryURL += "&count=" + count;
    if(offset) {
        queryURL += "&offset" + offset;
    }
    queryURL += "&output=full&format=json&callback=?";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET",
        dataType: "json"
    }).then((response) => {
        console.log(response);
        const pets = response.petfinder.pets.pet;
        pets.forEach((pet) => {
            displayPetCard(pet);
        });
    }).fail((error) => {
        console.log(error);
    });
    
    function displayPetCard(pet) {
        if(pet.media.photos) { // If there are no photos don't bother
            const name = pet.name["$t"];
            // const sex = pet.sex["$t"];
            // console.log(sex);
            const sex = getSex(pet.sex["$t"]);
            const breeds = getBreeds(pet.breeds.breed);
            const imgSrc = pet.media.photos.photo[3]["$t"];
            let petDiv = $("<div>");
            let img = $("<img>");
            img.attr("src", imgSrc);
            
            petDiv.append(img);
            petDiv.append($("<div>").text(name));
            petDiv.append($("<div>").text(breeds));
            petDiv.append($("<div>").text(sex));
            $("#pet-dump").append(petDiv);
        }
    }
    
    function getBreeds(breeds) {
        let breedString = "";
        if(Array.isArray(breeds)) {
            breeds.forEach((b) => {
                if(breedString === "") {
                    breedString += b["$t"]; 
                }
                else {
                    breedString += ", " + b["$t"];
                }
            });
        }
        else {
            breedString = breeds["$t"];
        }
        return breedString;
    }

    function getSex(sex) {
        if(sex == "F" || sex == "f") {
            return "Female";
        }
        if(sex == "M" || sex == "m") {
            return "Male";
        }
        else {
            return "Unknown sex";
        }
    }
}