$(document).ready(() => {
    $("#search-pets").on("click", (event) => {
        event.preventDefault();
        const zipcode = $("#input-zip-code").val().trim();
        const petType = $("#select-pet").val().trim();
        console.log(zipcode, petType);
        searchPets(zipcode, petType, 25);
        $("#input-zip-code").val("");
        $("#select-pet").val("");
        $("#sample-card").remove();
    });

    $(document).on("swiperight", ".pet-card", function(event) {
        // event.preventDefault();
        $(this).addClass("rotate-left").delay(700).fadeOut(1, () => {
            $(this).remove();
        });
    });

    $(document).on("swipeleft", ".pet-card", function(event) {
        // event.preventDefault();
        $(this).addClass("rotate-right").delay(700).fadeOut(1, () => {
            $(this).remove();
        });
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
            petDiv.addClass("card pet-card mx-auto");
            
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