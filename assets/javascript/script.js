// Testing basic API call, check console for results
$.ajax({
    url: "https://api.petfinder.com/pet.find?key=7dc1511d0faaadd24a44d60d637a14d8&location=44060&output=full&format=json" + "&callback=?",
    type: "GET",
    dataType: "json"
}).then((response) => {
    console.log(response);
}).fail((error) => {
    console.log("Failure to get API data", error);
})



$.ajax({
    url: "https://api.petfinder.com/shelter.get?key=7dc1511d0faaadd24a44d60d637a14d8&id=OH500&format=json" + "&callback=?",
    type: "GET",
    dataType: "json"
}).then((response) => {
    console.log(response);
}).fail((error) => {
    console.log("Failure to get API data", error);
})