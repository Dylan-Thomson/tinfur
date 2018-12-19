let zipcode;
let petType;
let offset;
let pets;
let favorites = [];
let favoriteData = [];
        
$(document).ready(() => {
    // initFavorites();

    $("#login").on("click", event => {
        event.preventDefault();
        console.log("login click");
        $("#login-modal").modal("show");
    });

    $("#login-btn").on("click", event => {
        event.preventDefault();
        let email = $("#email-input").val();
        const password = $("#password-input").val();
        const auth = firebase.auth();

        const promise = auth.signInWithEmailAndPassword(email, password);
        console.log("Logging in", email);
        $("#email-input").val("");
        $("#password-input").val("");
        promise.catch(error => {
            if(error) {
                $("#login-error-msg").text(error.message);
                console.log(error.message);
            }
            else {
                $("#login-modal").modal("hide");
                $("#login-error-msg").text("");
            }
        }); 
    });
    
    $("#signup-btn").on("click", event => {
        event.preventDefault();
        const email = $("#email-input").val();
        const password = $("#password-input").val();
        const auth = firebase.auth();
        
        const promise = auth.createUserWithEmailAndPassword(email, password);
        console.log("Signing up", email);
        $("#email-input").val("");
        $("#password-input").val("");
        promise.catch(error => {
            if(error) {
                $("#login-error-msg").text(error.message);
                console.log(error.message);
            }
            else {
                $("#login-modal").modal("hide");
                $("#login-error-msg").text("");
            }
        });
        
    });

    $("#logout-btn").on("click", event => {
        event.preventDefault();
        firebase.auth().signOut();
        console.log("Logging out", firebase.auth().currentUser.email);
        $("#login-modal").modal("hide");
    });

    $("#search-pets").on("click", event => {
        event.preventDefault();
        zipcode = $("#input-zip-code").val().trim();
        petType = $("#select-pet").val().trim();
        if(zipcode.length > 0) {
            offset = 0;
            pets = {};
            // console.log(zipcode, petType);
            searchPets(zipcode, petType, 10);
            $("#input-zip-code").val("");
            $("#select-pet").val("");
            $("#sample-card").addClass("d-none");
            $("#pet-container").removeClass("d-none");
            $("#pet-container").empty();
            $("#favorites-container").addClass("d-none");
            if($(window).width() < 992) {
                $(".navbar-toggler").click();
            }
        }
    });

    $(document).on("swiperight", ".pet-card", function(event) {
        addFavorite($(this).attr("data-petID"));
        $(this).addClass("rotate-left").delay(700).fadeOut(1, () => {
            $(this).remove();
            // console.log($(".pet-card").length);
            if($(".pet-card").length <= 0) {
                offset += 10;
                // console.log(offset);
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });
    
    $(document).on("swipeleft", ".pet-card", function(event) {
        $(this).addClass("rotate-right").delay(700).fadeOut(1, () => {
            $(this).remove();
            // console.log($(".pet-card").length);
            if($(".pet-card").length <= 0) {
                offset += 10;
                // console.log(offset);
                searchPets(zipcode, petType, 10, offset);
            }
        });
    });

    $("#favorites").on("click", event => {
        event.preventDefault();
        $("#sample-card").addClass("d-none");
        $("#favorites-container").removeClass("d-none");
        $("#pet-container").addClass("d-none");
        $(this).addClass("active");
        $("#home").removeClass("active");
        if($(window).width() < 992) {
            $(".navbar-toggler").click();
        }
    });
    
    $("#home").on("click", event => {
        event.preventDefault();
        $("#sample-card").removeClass("d-none");
        $("#favorites-container").addClass("d-none");
        $("#pet-container").addClass("d-none");
        $(this).addClass("active");
        $("#favorites").removeClass("active");
        if($(window).width() < 992) {
            $(".navbar-toggler").click();
        }
    });

    $("#clear-all").on("click", () => {
        removeAllFavorites();
        $("#clear-all").addClass("d-none");
    });

    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser) {
            console.log("logged in");            
            $("#login").text(firebaseUser.email);
            $("#login-form").addClass("d-none");
            $("#logout-btn").removeClass("d-none");
            $("#navbarDropdownMenuLink").removeClass("d-none");
            $("#home").removeClass("d-none");
            $("#favorites").removeClass("d-none");

            initFavorites();
            
        } else {
            console.log('not logged in');
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
            // navbarDropdownMenuLink
            // home
            //favorites
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
                console.log(userFavorites);
                if(userFavorites.length > 0) $("#clear-all").removeClass("d-none");
                userFavorites.forEach(userFavorite => {
                    favorites.push(userFavorite.id);
                    console.log(userFavorite.id);
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

function addFavorite(id) {
    if(firebase.auth().currentUser) {
        $("#clear-all").removeClass("d-none");
        favorites.push(id);
        const uid = firebase.auth().currentUser.uid;
        // localStorage.setItem("favorites", JSON.stringify(favorites));
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
            // console.log(response);
            displayFavorite(response.petfinder.pet);
            favoriteData.push(response.petfinder.pet);
        }).fail((error) =>{
            console.log(error);
        });
    }
}

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
    // localStorage.setItem("favorites", JSON.stringify(favorites));
}

function removeAllFavorites() {
    if(firebase.auth().currentUser) {
        const uid = firebase.auth().currentUser.uid;
        favorites = [];
        favoriteData = [];
        $(".favorite").remove();
        // localStorage.setItem("favorites", JSON.stringify(favorites));
        if(uid) {
            database.ref("users/" + uid + "/favorites").remove();
        }
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
    // console.log(queryURL);
    $.ajax({
        url: queryURL,
        type: "GET",
        dataType: "json"
    }).then((response) => {
        // console.log(response);
        pets = response.petfinder.pets.pet;
        // console.log(response.petfinder.lastOffset["$t"]);
        offset = response.petfinder.lastOffset["$t"];
        pets.forEach((pet) => {
            if(!favorites.includes(pet.id["$t"])) {
                displayPetCard(pet);
            }
        });
        if($(".pet-card").length <= 0) {
            // offset = Number(offset) + 10;
            // console.log(offset);
            searchPets(zipcode, petType, 10, offset);
        }
    }).fail((error) => {
        console.log(error);
    });
}

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

function displayFavorite(pet) {
    // console.log(pet);
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

    
    favDiv.attr("data-toggle", "modal");
    favDiv.attr("data-target", "#favorite-info");
    favDiv.attr("data-petID", pet.id["$t"]);
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
        $("#get-directions").text("Get Directions")
        $("#get-directions").attr("href", "https://www.google.com/maps/dir/?api=1&destination="+petData.contact.address1.$t+","+petData.contact.city.$t+","+petData.contact.state.$t);
        $("#get-directions").attr("target", "_blank");
        

        $("#fav-remove").off("click");
        $("#fav-remove").on("click", () => {
            removeFavorite(id);
            $("#favorite-info").modal("toggle");
        });

        $("#favorite-info").show();
    });

    $("#favorites-container").append(favDiv);

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

function getPetDataFromID(id) {
    let petData;
    favoriteData.forEach((favorite) => {
        let favoriteID = favorite.id["$t"];
        if(favoriteID === id) {
            petData = favorite;
            return false;
        }
    });
    // console.log("got pet data", petData);
    return petData;

}