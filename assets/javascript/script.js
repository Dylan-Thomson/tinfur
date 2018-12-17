let zipcode;
let petType;
let offset;
let pets;
let favorites = [];

$(document).ready(() => {
    initFavorites();
    $("#search-pets").on("click", (event) => {
        event.preventDefault();
        zipcode = $("#input-zip-code").val().trim();
        petType = $("#select-pet").val().trim();
        if(zipcode.length > 0) {
            offset = 0;
            pets = {};
            console.log(zipcode, petType);
            searchPets(zipcode, petType, 10);
            $("#input-zip-code").val("");
            $("#select-pet").val("");
            $("#sample-card").addClass("d-none");
            $("#pet-container").removeClass("d-none");
            $("#pet-container").empty();
            $("#favorites-container").addClass("d-none");
        }
    });

    $(document).on("swiperight", ".pet-card", function(event) {
        favorites.push($(this).attr("data-petID"));
        localStorage.setItem("favorites", JSON.stringify(favorites));
        console.log(favorites);
        $(this).addClass("rotate-left").delay(700).fadeOut(1, () => {
            $(this).remove();
            console.log($(".pet-card").length);
            if($(".pet-card").length <= 0) {
                offset += 10;
                console.log(offset);
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });
    
    $(document).on("swipeleft", ".pet-card", function(event) {
        $(this).addClass("rotate-right").delay(700).fadeOut(1, () => {
            $(this).remove();
            console.log($(".pet-card").length);
            if($(".pet-card").length <= 0) {
                offset += 10;
                console.log(offset);
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });

    $("#favorites").on("click", (event) => {
        event.preventDefault();
        $("#sample-card").addClass("d-none");
        $("#favorites-container").removeClass("d-none");
        $("#pet-container").addClass("d-none");
    });
    
    $("#home").on("click", (event) => {
        event.preventDefault();
        $("#sample-card").removeClass("d-none");
        $("#favorites-container").addClass("d-none");
        $("#pet-container").addClass("d-none");
    });

});

function initFavorites() {
    if(localStorage.favorites){
        favorites = JSON.parse(localStorage.favorites);
    }
}

function searchPets(zip, type, count, offset) {
    let queryURL = "https://api.petfinder.com/pet.find?key=7dc1511d0faaadd24a44d60d637a14d8"
    queryURL += "&location=" + zip;
    if(type !== "any") {
        queryURL += "&animal=" + type;
    }
    queryURL += "&count=" + count;
    if(offset) {
        queryURL += "&offset=" + offset;
    }

    queryURL += "&output=full&format=json&callback=?";
    console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET",
        dataType: "json"
    }).then((response) => {
        console.log(response);
        pets = response.petfinder.pets.pet;
        console.log(response.petfinder.lastOffset["$t"]);
        offset = response.petfinder.lastOffset["$t"];
        pets.forEach((pet) => {
            if(!favorites.includes(pet.id["$t"])) {
                displayPetCard(pet);
            }
        });
        if($(".pet-card").length <= 0) {
            // offset = Number(offset) + 10;
            console.log(offset);
            searchPets(zipcode, petType, 10, offset);
        }
    }).fail((error) => {
        console.log(error);
    });
    
    function displayPetCard(pet) {
        if(pet.media.photos) { // If there are no photos don't bother
            const name = pet.name["$t"];
            const sex = getSex(pet.sex["$t"]);
            const breeds = getBreeds(pet.breeds.breed);
            const imgSrc = pet.media.photos.photo[3]["$t"];
            let petDiv = $("<div>");

            let img = $("<img>");
            img.attr("src", imgSrc);
            img.attr("alt", name);
            img.addClass("card-img-top");
            petDiv.append(img);

            let cardBody = $("<div>");
            cardBody.addClass("card-body");
            let h5 = $("<h5>");
            h5.addClass("card-title");
            h5.text(name);
            cardBody.append(h5);
            // petDiv.append($("<div>").text(name));
            cardBody.append($("<div>").text(breeds));
            cardBody.append($("<div>").text(sex));

            petDiv.append(cardBody);
            petDiv.attr("data-petID", pet.id["$t"]);
            petDiv.addClass("card pet-card mx-auto");
            
            $("#pet-container").append(petDiv);
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