/**
 * Created by Zdenda on 23.1.14.
 */


/*
mobil -
- app se pusti nove
	- nacte se 			


synchro aplikace
- zkusi se nacist on-line zbozi
    - ok
        - nacte se zbozi
        - nacte se profil
        - ulozi se
    - ko
        - nacte se storage zbozi
        - i profil

- nacteni zbozi
    - nacte json
    - kontrola obrazku, dostazeni novych obrazku

*/


function save()
{
    var neco = $('#testInput').val();
    console.log(neco);
    window.localStorage.setItem("key", neco );
}
function load()
{
    var neco = window.localStorage.getItem("key");
    //var neco = window.localStorage.getItem("uu");
    //if(window.localStorage.getItem("uu")==null) alert("null");
    console.log(neco);
    $('#testInput').val(neco);
}

function storageLoad(type)
{
	//console.log("zobbrazuji:" + (window.localStorage.getItem("dataProfil")));
    var arr = type.split(",");
    for(var i=0;i<arr.length;i++)
    {
        console.log("storageLoad: "+ arr[i]);
        if(type.indexOf(arr[i]) != -1)
        {
            if(window.localStorage.getItem(arr[i])!=null)
            {
                console.log(arr[i]);
                console.log(window.localStorage.getItem(arr[i]));
                //dataZbozi = JSON.parse(window.localStorage.getItem("dataZbozi"));
                eval(arr[i] + ' = JSON.parse(window.localStorage.getItem("'+arr[i]+'"))');
            }
        }
    }
}

function storageSave(type)
{
    console.log("storageSave:" + type);
    if(type.indexOf("dataZbozi") != -1)
    {
        window.localStorage.setItem("dataZbozi", JSON.stringify(dataZbozi) );
        console.log("dataZbozi");
    }
    //console.log(JSON.stringify(dataZbozi));
    //console.log(dataZbozi);
    if(type.indexOf("dataKategorie") != -1) window.localStorage.setItem("dataKategorie", JSON.stringify(dataKategorie) );
    if(type.indexOf("dataProfil") != -1) window.localStorage.setItem("dataProfil", JSON.stringify(dataProfil) );
}


//=====================================================


var imgCach = function() {
    console.log("imgCach start");
    //return;
    /* Note: this is using version 2.x of the imagesloaded library, use of current version might differ */
    $('#ulVybratSvacu').imagesLoaded(function($images, $proper, $broken ) {

        // see console output for debug info
        ImgCache.options.debug = true;
        ImgCache.options.usePersistentCache = true;

        ImgCache.init(function() {
            // 1. cache images
            for (var i = 0; i < $proper.length; i++) {
                ImgCache.cacheFile($($proper[i]).attr('src'));
            }
            // 2. broken images get replaced
            for (var i = 0; i < $broken.length; i++) {
                ImgCache.useCachedFile($($broken[i]));
            }

        });
    });
};

/*
if (typeof(cordova) !== 'undefined') {
    // cordova test
    document.addEventListener('deviceready', startTest, false);
} else {
    // normal browser test
    $(document).ready(startTest);
}
*/