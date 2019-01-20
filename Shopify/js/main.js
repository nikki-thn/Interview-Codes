var wasteItems = []; // Storing data

$(function () {

    makeAjaxCall(); // Make an ajax call to retrieve data
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
                item.tempId = ++id; //id to identify an item
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

    let searchKeyword = $("#searchBox").val();

    //If no keyword was entered, alert a message
    if (searchKeyword == "") {
        alert("Please enter a keyword to begin searching");
    }
    // Else, process
    else {

        //Search for matching item and store in an array
        let searchResults = $.grep(wasteItems, function (item) {
            return item.title.toLowerCase().match(searchKeyword.toLowerCase());
        });

        //Alert user when no items found
        if (searchResults.length == 0) {
            resultDiv.append('<h3 style="margin-left: 20px;">No item found</h3');
        }

        //Append elements
        searchResults.forEach(function (item) {
            var starTemplate = "";

            //Each star icon is assigned the item unique id for identification
            if (item.isFavourited == true) {
                //green star if item is favourited
                starTemplate = '<span class="star green-star" onclick="favouriteItem(this.id)" id="'
                    + item.tempId + '"><i class="fa fa-star"></i></span> ';
            } else {
                //gray star otherwise
                starTemplate = '<span class="star gray-star"  onclick="favouriteItem(this.id)" id="'
                    + item.tempId + '"><i class="fa fa-star"></i></span> ';
            }

            //append the item into assigned div
            resultDiv.append('<div class="col-sm-6 body-column">' + starTemplate + item.title + '</div>');
            resultDiv.append('<div class="col-sm-6 body-column">' + item.body + '</div>');
        });
    }
}

//This method to set item favourite/unfavourite an item 
function favouriteItem(itemId) {

    //set/unset isFavourited property
    wasteItems.forEach(function (item) {
        if (item.tempId == itemId) {

            //If favourited, unset
            if (item.isFavourited == true) {
                item.isFavourited = false;
            }
            //Else, set item as favourite
            else {
                item.isFavourited = true;
            }
        }
    });

    loadFavItems(); //to append favourite or remove unfavourite
    searchItems(); //to reload the results section after change
}

//This method will go through wasteItems and append favourites
function loadFavItems() {

    //Location to append 
    let favouriteDiv = $("#favourite-table");
    favouriteDiv.empty(); 

    wasteItems.forEach(function (item) {
        //Only display favourited item
        if (item.isFavourited == true) {
            //Assign green star
            var starTemplate = '<span class="star green-star"><i class="fa fa-star"></i></span> ';
            favouriteDiv.append('<div class="col-sm-6 body-column">' + starTemplate + item.title + '</div>');
            favouriteDiv.append('<div class="col-sm-6 body-column">' + item.body + '</div>');
        }
    });
}
