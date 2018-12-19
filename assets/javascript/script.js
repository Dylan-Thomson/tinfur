let zipcode;
let petType;
let offset;
let pets;
let favorites = [];
let favoriteData = [];
        
$(document).ready(() => {
    // Display login form
    $("#login").on("click", event => {
        event.preventDefault();
        $("#login-modal").modal("show");
    });

    // Log in existing user
    $("#login-btn").on("click", event => {
        event.preventDefault();
        $("#login-error-msg").text("");
        let email = $("#email-input").val();
        const password = $("#password-input").val();
        const auth = firebase.auth();

        const promise = auth.signInWithEmailAndPassword(email, password).then(() => {
            $("#login-modal").modal("hide");
            $("#email-input").val("");
            $("#password-input").val("");
        });
        promise.catch(error => {
            $("#login-error-msg").text(error.message);
        }); 
    });
    
    // Sign up new user
    $("#signup-btn").on("click", event => {
        event.preventDefault();
        $("#login-error-msg").text("");
        const email = $("#email-input").val();
        const password = $("#password-input").val();
        const auth = firebase.auth();
        
        const promise = auth.createUserWithEmailAndPassword(email, password).then(() => {
            $("#login-modal").modal("hide");
            $("#email-input").val("");
            $("#password-input").val("");
        });
        promise.catch(error => {
            $("#login-error-msg").text(error.message);
        });
        
    });

    // Log out user
    $("#logout-btn").on("click", event => {
        event.preventDefault();
        firebase.auth().signOut();
        $("#login-modal").modal("hide");
    });

    // Submit pet search
    $("#search-pets").on("click", event => {
        event.preventDefault();
        zipcode = $("#input-zip-code").val().trim();
        petType = $("#select-pet").val().trim();
        if(isValidZipcode(zipcode)) {
            $("#zip-error-msg").text("");
            offset = 0;
            pets = {};
            searchPets(zipcode, petType, 10);
            $("#input-zip-code").val("");
            $("#select-pet").val("");
            $("#sample-card").addClass("d-none");
            $("#pet-container").removeClass("d-none");
            $("#pet-container").empty();
            $("#favorites-container").addClass("d-none");
            // Auto close dropdown afterwards on small screens
            if($(window).width() < 992) {
                $(".navbar-toggler").click();
            }
        }
        else {
            $("#zip-error-msg").text("Invalid US zip code");
        }
    });

    // Swipe right, animate, remove current card, add current card to favorites
    $(document).on("swiperight", ".pet-card", function(event) {
        addFavorite($(this).attr("data-petID"));
        $(this).addClass("rotate-left").delay(700).fadeOut(1, () => {
            $(this).remove();
            // When user swipes through all cards in query, get next group
            if($(".pet-card").length <= 0) {
                offset += 10;
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });
    
    // Swipe left, animate and remove current card
    $(document).on("swipeleft", ".pet-card", function(event) {
        $(this).addClass("rotate-right").delay(700).fadeOut(1, () => {
            $(this).remove();
            // When user swipes through all cards in query, get next group
            if($(".pet-card").length <= 0) {
                offset += 10;
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });

    // Favorites screen
    $("#favorites").on("click", event => {
        event.preventDefault();
        $("#sample-card").addClass("d-none");
        $("#favorites-container").removeClass("d-none");
        $("#pet-container").addClass("d-none");
        $(this).addClass("active");
        $("#home").removeClass("active");
        // Auto close dropdown afterwards on small screens
        if($(window).width() < 992) {
            $(".navbar-toggler").click();
        }
    });
    
    // Home screen
    $("#home").on("click", event => {
        event.preventDefault();
        $("#sample-card").removeClass("d-none");
        $("#favorites-container").addClass("d-none");
        $("#pet-container").addClass("d-none");
        $(this).addClass("active");
        $("#favorites").removeClass("active");
        // Auto close dropdown afterwards on small screens
        if($(window).width() < 992) {
            $(".navbar-toggler").click();
        }
    });

    // Click to remove all favorites
    $("#clear-all").on("click", () => {
        removeAllFavorites();
        $("#clear-all").addClass("d-none");
    });

    // Handle login/logout
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser) {
            // Display user email
            $("#login").text(firebaseUser.email);
            $("#login-form").addClass("d-none");
            $("#logout-btn").removeClass("d-none");
            $("#navbarDropdownMenuLink").removeClass("d-none");
            $("#home").removeClass("d-none");
            $("#favorites").removeClass("d-none");

            // Get user's favorites and display
            initFavorites();
            
        } else {
            $("#home").click();
            $(".favorites").remove();
            favoriteData = [];
            favorites = [];
            $("#login").text("Login");
            $("#login-form").removeClass("d-none");
            $("#logout-btn").addClass("d-none");
            $("#navbarDropdownMenuLink").addClass("d-none");
            $("#home").addClass("d-none");
            $("#favorites").addClass("d-none");
        } 
      });
});

// Get favorites from local storage and populate favorites div
function initFavorites() {
    const uid = firebase.auth().currentUser.uid;
    if(uid) {
        database.ref("users/" + uid + "/favorites").once("value").then(snapshot => {
            if(snapshot.val()) {
                const userFavorites = Object.values(snapshot.val());
                if(userFavorites.length > 0) $("#clear-all").removeClass("d-none");
                userFavorites.forEach(userFavorite => {
                    favorites.push(userFavorite.id);
                    let queryURL = "https://api.petfinder.com/pet.get?key=7dc1511d0faaadd24a44d60d637a14d8&id=";
                    queryURL += userFavorite.id;
                    queryURL += "&format=json&callback=?";
                    $.ajax({
                        url: queryURL,
                        type: "GET",
                        dataType: "json"
                    }).then((response) => {
                        displayFavorite(response.petfinder.pet);
                        favoriteData.push(response.petfinder.pet);
                    }).fail((error) =>{
                        console.log(error);
                    });
                });
            }
        });
    }
}

// Add favorite to firebase and local variables given id
function addFavorite(id) {
    if(firebase.auth().currentUser) {
        $("#clear-all").removeClass("d-none");
        favorites.push(id);
        const uid = firebase.auth().currentUser.uid;

        if(uid) {
            database.ref("users/" + uid + "/favorites").push({id});
        }
    
        let queryURL = "https://api.petfinder.com/pet.get?key=7dc1511d0faaadd24a44d60d637a14d8&id=";
        queryURL += id;
        queryURL += "&format=json&callback=?";
        $.ajax({
            url: queryURL,
            type: "GET",
            dataType: "json"
        }).then((response) => {
            displayFavorite(response.petfinder.pet);
            favoriteData.push(response.petfinder.pet);
        }).fail((error) =>{
            console.log(error);
        });
    }
}

// Remove favorite from firebase and local variables given id
function removeFavorite(id) {
    if(firebase.auth().currentUser) {
        const uid = firebase.auth().currentUser.uid;
        if(uid) {
            database.ref("users/" + uid + "/favorites").orderByChild("id").equalTo(id).once("value", snapshot => {
                const updates = {};
                snapshot.forEach(child => updates[child.key] = null);
                database.ref("users/" + uid + "/favorites").update(updates);
            });
        }
        favorites = favorites.filter(favID => favID !== id);
        favoriteData = favoriteData.filter((favorite) => {
            let favID = favorite.id["$t"];
            return favID !== id;
        });
        $(".favorite[data-petID=\"" + id + "\"]").remove();
        if(favorites.length <= 0) {
            $("#clear-all").addClass("d-none");
        }
    }
}

// Remove all favorites on firebase and local variables
function removeAllFavorites() {
    if(firebase.auth().currentUser) {
        const uid = firebase.auth().currentUser.uid;
        favorites = [];
        favoriteData = [];
        $(".favorite").remove();
        if(uid) {
            database.ref("users/" + uid + "/favorites").remove();
        }
    }
}

// Call petfinder API using search parameters
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
    $.ajax({
        url: queryURL,
        type: "GET",
        dataType: "json"
    }).then((response) => {
        pets = response.petfinder.pets.pet;
        offset = response.petfinder.lastOffset["$t"];
        pets.forEach((pet) => {
            if(!favorites.includes(pet.id["$t"])) {
                // display pet if not stored in favorites
                displayPetCard(pet);
            }
        });
        if($(".pet-card").length <= 0) {
            // Get more pets if there are none to display (all are favorites)
            searchPets(zipcode, petType, 10, offset);
        }
    }).fail((error) => {
        console.log(error);
    });
}

// Display swipable pet card
function displayPetCard(pet) {
    if(pet.media.photos) { // If there are no photos don't bother
        const name = pet.name["$t"];
        const sex = getSex(pet.sex["$t"]);
        const breeds = getBreeds(pet.breeds.breed);
        const imgSrc = pet.media.photos.photo[2]["$t"]
        
        let img = $("<img>");
        img.attr("src", imgSrc);
        img.attr("alt", name);
        img.addClass("card-img pet-img");
        
        let title = $("<h5>");
        title.addClass("card-title dark-transparent-bg my-0 p-1");
        title.text(name);
        
        let breedText = $("<p>");
        breedText.addClass("card-text dark-transparent-bg m-0");
        breedText.text(breeds);
        
        let sexText = $("<p>");
        sexText.addClass("card-text dark-transparent-bg m-0");
        sexText.text(sex); 
        
        let overlay = $("<div>");
        overlay.addClass("card-img-overlay p-0 d-flex flex-column justify-content-end text-center");
        overlay.append(title);
        overlay.append(breedText);
        overlay.append(sexText);
        
        let petDiv = $("<div>");
        petDiv.append(img);
        petDiv.append(overlay);
        petDiv.attr("data-petID", pet.id["$t"]);
        petDiv.addClass("card pet-card bg-dark text-white");
        $("#pet-container").append(petDiv);
    }
}

// Display favorite pet, click to get more info
function displayFavorite(pet) {
    const name = pet.name["$t"];
    const imgSrc = pet.media.photos.photo[3]["$t"]

    let img = $("<img>")
    img.attr("src", imgSrc);
    img.attr("alt", name);
    img.addClass("card-img pet-img");

    let title = $("<h5>");
    title.addClass("card-title dark-transparent-bg my-0 p-1");
    title.text(name);
    
    let overlay = $("<div>");
    overlay.addClass("card-img-overlay p-0 d-flex flex-column justify-content-end text-center");
    overlay.append(title);

    let favDiv = $("<div>");
    favDiv.addClass("card bg-dark text-white favorite my-1 mx-auto");
    favDiv.append(img);
    favDiv.append(overlay);

    // Set up favorite modal functionality
    favDiv.attr("data-toggle", "modal");
    favDiv.attr("data-target", "#favorite-info");
    favDiv.attr("data-petID", pet.id["$t"]);
     // Populate favorite modal data
    favDiv.on("click", function() {
        let id = $(this).attr("data-petID");
        let petData = getPetDataFromID(id);

        $("#fav-name").empty();
        $("#fav-name").text(petData.name["$t"]);

        $("#fav-img").attr("src", "");
        $("#fav-img").attr("src", petData.media.photos.photo[3]["$t"]);

        $("#fav-breeds").empty();
        $("#fav-breeds").text(getBreeds(petData.breeds.breed));

        $("#fav-sex").empty();
        $("#fav-sex").text(getSex(petData.sex["$t"]));

        $("#fav-age").empty();
        $("#fav-age").text(petData.age["$t"]);

        $("#fav-desc").empty();
        $("#fav-desc").text(petData.description["$t"]);

        $("#fav-phone").empty();
        $("#fav-phone").attr("href", "");
        $("#fav-phone").text(petData.contact.phone["$t"]);
        $("#fav-phone").attr("href", "tel:" + petData.contact.phone["$t"]);

        $("#fav-email").empty();
        $("#fav-email").attr("href", "");
        $("#fav-email").text(petData.contact.email["$t"]);
        $("#fav-email").attr("href", "mailto:" + petData.contact.email["$t"]);

        $("#fav-addr1").empty();
        $("#fav-addr1").text(petData.contact.address1["$t"]);

        $("#fav-addr2").empty();
        $("#fav-addr2").text(petData.contact.address2["$t"]);

        $("#fav-city").empty();
        $("#fav-city").text(petData.contact.city["$t"]);

        $("#fav-state").empty();
        $("#fav-state").text(petData.contact.state["$t"]);

        $("#fav-zip").empty();
        $("#fav-zip").text(petData.contact.zip["$t"]);

        $("#get-directions").empty("href");
        $("#get-directions").text("Get Directions");
        
        // Display get directions if we have a valid address to work with
        if(isValidAddress(petData.contact.address1["$t"])) {
            $("#get-directions").removeClass("d-none");
            $("#get-directions").attr("href", "https://www.google.com/maps/dir/?api=1&destination="+petData.contact.address1.$t+","+petData.contact.city.$t+","+petData.contact.state.$t);
            $("#get-directions").attr("target", "_blank");
        }
        else {
            $("#get-directions").addClass("d-none");
        }
        
        // Remove old listener for favorite removal button
        $("#fav-remove").off("click");
        // Generate new listener for favorite removal button
        $("#fav-remove").on("click", () => {
            removeFavorite(id);
            $("#favorite-info").modal("toggle");
        });
        //Finally show modal
        $("#favorite-info").show();
    });

    // Add favorite card to container
    $("#favorites-container").append(favDiv);

}

// Get breed/breeds for an animal and return as formated string
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

// Get sex of animal and return as string
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

// Get locally stored pet information given an ID
function getPetDataFromID(id) {
    let petData;
    favoriteData.forEach((favorite) => {
        let favoriteID = favorite.id["$t"];
        if(favoriteID === id) {
            petData = favorite;
            return false;
        }
    });
    return petData;
}

function isValidAddress(address) {
    return address.length > 1 && /\d/.test(address) && address.substr(0,1).toLowerCase() !== "po";
}

function isValidZipcode(zipcode) {
    return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(zipcode);
}