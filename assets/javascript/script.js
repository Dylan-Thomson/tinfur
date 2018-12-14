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
        console.log($("#input-zip-code").val(), $("#select-pet").val());
        searchPets($("#input-zip-code").val(), $("#select-pet").val(), 10);
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
            const name = pet.name["$t"];
            let breed = "";
            let breeds = pet.breeds.breed;
            if(Array.isArray(breeds)) {
                breeds.forEach((b) => {
                    if(breed === "") {
                        breed += b["$t"]; 
                    }
                    else {
                        breed += ", " + b["$t"];
                    }
                });
            }
            else {
                breed = breeds["$t"];
            }
            const imgSrc = pet.media.photos.photo[3]["$t"];
            let petDiv = $("<div>");
            let img = $("<img>");
            img.attr("src", imgSrc);

            petDiv.append(img);
            petDiv.append($("<div>").text(name));
            petDiv.append(breed);
            $("#pet-dump").append(petDiv);
        });
        // console.log(response.petfinder.pets.pet[0].media.photos.photo[3]["$t"]);
        // let img = $("<img>");
        // img.attr("src", response.petfinder.pets.pet[0].media.photos.photo[3]["$t"])
        // $("#pet-dump").append(img);
    }).fail((error) => {
        console.log(error);
    });
}