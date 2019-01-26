var wasteItems = []; // Storing data

$(function () {

    makeAjaxCall(); // Make an ajax call to retrieve data

    $("#searchBox").on("keyup", function(){ 
        searchItems();
    });
});

//This method make an ajax call to retrieve data and store in wasteItems array 
function makeAjaxCall() {

    let APIUrl = "https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000";

    $.ajax({
        url: APIUrl,
        type: "GET",
        contentType: "application/json"
    })
        .done(function (data) {
            var id = 0; //Counter arbitrary id for local usage

            //parse object from ajax call to wasteItems
            data.forEach(function (item) { wasteItems.push(item); });

            //further processes to santitize the data
            wasteItems.forEach(function (item) {
                item.body = item.body.replace(/&lt;/g, '<');
                item.body = item.body.replace(/&gt;/g, '>');
                item.body = item.body.replace(/&nbsp;/g, ' ');
                item.body = item.body.replace(/&amp;/g, '&');
                item.body = item.body.replace(/&quot;/g, '"')
                item.isFavourited = "false"; //property to favourite an item
                item.tempId = id++; //id to identify an item
            });
        })
        .fail(function (err) {
            alert("error: " + err.statusText);
        });
}

//This method searches for items match user input and display results
function searchItems() {

    let resultDiv = $("#result-table");
    resultDiv.empty();

    let searchKeyword = $("#searchBox").val().toLowerCase();

    //Search for matching item and store in an array
    let searchResults = $.grep(wasteItems, function (item) {
        return item.title.toLowerCase().match(searchKeyword) || 
                item.body.toLowerCase().match(searchKeyword) ||
                item.category.toLowerCase().match(searchKeyword) ||
                item.keywords.toLowerCase().match(searchKeyword);
    });

    //Alert user when no items found
    if (searchResults.length == 0) {
        resultDiv.append('<h3 style="margin-left: 20px;">No item found</h3');
    }

    loadSearchItems("#result-table", searchResults);
}

//This method to set item favourite/unfavourite an item 
function favouriteItem(itemId) {

    //set/unset isFavourited property
    wasteItems.forEach((item) => {
        if (item.tempId == itemId) {
            //If favourited, unset
            if (item.isFavourited == true) {
                item.isFavourited = false;
            } else {
                item.isFavourited = true;
            }
        }
    });

    searchItems();
    loadFavItems();
}

//This method will go through wasteItems and append favourites
function loadSearchItems(divTbl, items) {
    //<%-item.tempId%> 
    let rowTemplate = _.template('<% _.forEach(wasteItems, function(item) { %>' +
        '<div class="row body-row">' +
        '<div class="col-sm-6 body-column"><span class"star" onclick="favouriteItem(this.id)" id="<%-item.tempId%>">' + 
        '<i class="fa fa-star"></i></span> <%- item.title %></div>' +
        '<div class="col-sm-6 body-column"><%= item.body %></div>' + '</div>' + '<% }); %>');  

    //Location to append 
    let rows = rowTemplate({'wasteItems': items});

    $(divTbl).empty(); 
    $(divTbl).append(rows);


    items.forEach((item) => {
        let itemId = '#' + item.tempId;
        if (item.isFavourited == true){
            $(itemId).attr('class', 'green-star');
        } else {
            $(itemId).attr('class', 'gray-star');
        }
    });
}

//This method will go through wasteItems and append favourites
function loadFavItems() {

    let favItems = _.filter(wasteItems, (item) => {
        return item.isFavourited == true;
    });

    //Location to append 
    let favouriteDiv = $("#favourite-table");
    favouriteDiv.empty(); 

    favItems.forEach(function (item) {
        //Assign green star
        var starTemplate = starTemplate = '<span class="star green-star" onclick="favouriteItem(this.id)" id="' 
        + item.tempId + '"><i class="fa fa-star"></i></span> ';
        favouriteDiv.append('<div class="col-sm-6 body-column">' + starTemplate + item.title + '</div>');
        favouriteDiv.append('<div class="col-sm-6 body-column">' + item.body + '</div>');
    });

}
