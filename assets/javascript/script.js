// Testing basic API call, check console for results
$.ajax({
    url: "http://api.petfinder.com/pet.find?key=7dc1511d0faaadd24a44d60d637a14d8&location=44060&format=json" + "&callback=?",
    type: "GET",
    dataType: "json"
}).then((response) => {
    console.log(response);
}).fail((error) => {
    console.log("Failure to get API data", error);
})