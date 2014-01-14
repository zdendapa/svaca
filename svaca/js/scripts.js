/*
 v9
 - odebrano ctvercove menu
 - oprava pozadi barvy headeru - typ produktu
 - dodlany filtry headerech - typ produktu
 - kosik - zobrazeni cisla 1-5
 - tlac zaplatit hned pod kosikem
 - zvětšení horního menu relativně podle velikosti písma
 - html verze stranky kdyz neni kredit
 */


var zbozi;
var kategorie;
var zboziOblibene=[];
var kosik =[];
var kosikSoucetCeny = 0;
var objednavka ="";
var appPreffix = "svaca/";

$(document).ready(function(){

    // TODO hack upravy ---------
    var viewport = {
        width  : $(window).width(),
        height : $(window).height()
    };
        // kosik nastaveni 60% height
        $('.ulKosik').css('max-height',viewport.height*0.6);
        $('#ulKosik').css('position','relative');
        $('#ulKosik').css('margin-bottom','0px');
        $('.ulKosikFooter').css('position','relative');
    // --------------------------

    zboziNactiAjax();

    $("#pages a").click(function(e){
        //if(e.target.hash.slice(1)=="") console.log("nic");
        e.preventDefault();
        if(e.target.hash == null) return;
        var nextPage = $(e.target.hash);
        if(e.target.hash.slice(1)!="") {
            transition(nextPage, 'fade');
            //console.log(e.target.hash.slice(1));
            $("#pages").attr("className", e.target.hash.slice(1));
        }


    });





});



function transition(toPage, type) {

    $('#menuLeftDiv').css('display','none');
    var toPage = $(toPage),
        fromPage = $("#pages .current");

    if(toPage.hasClass("current") || toPage === fromPage) {
        return;
    };

    toPage
        .addClass("current " + type + " in")
        .one("webkitAnimationEnd", function(){
            fromPage.removeClass("current " + type + " out");
            toPage.removeClass(type + " in")
        });
    fromPage.addClass(type + " out");

    if(!("WebKitTransitionEvent" in window)){
        toPage.addClass("current");
        fromPage.removeClass("current");
        return;
    }

    // operace nad strankamy
    console.log("zmena stranky na:" + toPage.selector);
    if(toPage.selector=="#page-profil")
    {
        console.log("profilNacti");
        profilNacti();
    }
    if(toPage.selector=="#page-vybratSvacu")
    {
        //TODO synchronizaci na zbozi, ale aby to neprepisovalo cisla v kosiku
        //zboziNactiAjax();
        profilNacti();  // update kreditu
        //alert("Načítám data");
    }
    if(toPage.selector=="#page-koupitSvacuZaplatit") {

        kosikRefresh();
    }
    if(toPage.selector=="#page-mojeOblibene") {

        zboziOblibneRefresh();
    }
}

function kosikZobrazCisloVkolecku() {
    var kosikPocetPolozek = kosik.length;
    if(kosikPocetPolozek>0) {
        $("#circleKosikH1").text(kosikPocetPolozek);
        $("#circleKosikH1").css('display','block');
    } else
    {
        $("#circleKosikH1").css('display','none');
    }


}


/*
 logika nacitani:
 document ready     -   nacteni zbozi (pri neprihlasen jde na prihlaseni)
 prihlaseni         -   nacteni zbozi
                    -   kosik empty
                    -   getUserInfo = jmeno(horni lista), profil, kredit(horni lista)
 page-vybratSvacu   -   nacteni zbozi
                    -   getUserInfo (kredit)

 */


function zboziOblibeneAdd(vlozitID) {
    //zjisti hestli jiz neni vlozene
    var jizVlozene = false;
    for(var i=0; i<zboziOblibene.length; i++)
    {
        if(zboziOblibene[i]==vlozitID)
        {
            jizVlozene = true;
        }
    }

    if(!jizVlozene)
    {
        console.log("pridavam do oblibenych:" + vlozitID);
        zboziOblibene.push(vlozitID);
    }
}

function kosikAdd(produkt,vlozitID) {

    if($(produkt).text().length>1)
    {
        $(produkt).text("1");
        $(produkt).attr('class', 'produktKosik produktKosikCislo');
    } else
    {
        var pocet = $(produkt).text();
        pocet ++;
        if(pocet<6)
        {
            $(produkt).text(pocet);
        }
        else
        {
            console.log("vic jak pet");
            kosikOdebrat(vlozitID);
            $(produkt).html("Přidat do<br>košíku");
            $(produkt).attr('class', 'produktKosik produktKosikObr');
            kosikZobrazCisloVkolecku();
            return;
        }
    }

    kosik.push(vlozitID);
    kosikZobrazCisloVkolecku();

}

function kosikOdebrat(odebratID)
{
    console.log("odebiram z kosiku: " + odebratID);
    pocet = 5;
    for(var i= kosik.length; i>-1; i--)
    {
        if(kosik[i]==odebratID && pocet >0)
        {
            kosik.splice(i,1);
            pocet --;
        }
    }
}



function ajaxError(xhr, textStatus, error){
    console.log(xhr.statusText);
    console.log(textStatus);
    console.log(error);
}
function ajaxError2(data){
    console.log("ajaxError2");
    console.log(data);

    if( data.status == "error" && data.code == "not logged")
    {
        console.log(data.msg);
        console.log("ajaxError2 data.msg:" + data.msg);
        prihlaseniZobrazDialog();
        alertZobraz(data.msg);
        return;
    }


    alert("Nelze se připojit k serveru!")
    //alert($.param(data));
;
}



function profilNacti()
{
    console.log("profilNacti");
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/getUserInfo',
        success: function(data) {
            console.log("profilNacti success");
            if(data.status == "ok")
            {
                $('#koupitUserName').text(data.fullName==null?"":data.fullName);
                $('#vybratSvacuKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
                $('#potvrzeniPlatbyKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
                $('#koupitSvacuZaplatitKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));
                $('#dokoncitPlatbuPozitivniKredit').text(data.balance==null?"0 Kč":("Kredit: " + data.balance + " Kč"));


                $( "#profilUsernameH" ).text(data.username==null?"":data.username);
                $( "#profilJmenoH" ).text(data.jmeno==null?"":data.jmeno);
                $( "#profilPrijmeniH" ).text(data.jmeno==null?"":data.prijmeni);
                $( "#profilEmailH" ).text(data.jmeno==null?"":data.email);
                $( "#profilTridaH" ).text(data.jmeno==null?"":data.trida);
                $( "#profilSkolaH" ).text(data.jmeno==null?"":data.skola);
                $( "#profilTelefonH" ).text(data.jmeno==null?"":data.telefon);
                //if(data.jmeno ==null) console.log("prazdne");
            }
            if(data.status == "error" && data.code == "not logged")
            {
                prihlaseniZobrazDialog();
                alertZobraz(data.msg);
            }
        },
        error: ajaxError2


    });




}

function nacistDataPoPrihlaseni()
{
    kosikPocetPolozek = 0;
    kosik =[];
    kosikSoucetCeny = 0;
    kosikZobrazCisloVkolecku();
    profilNacti();
    kosikRefresh();
    nastavZpetProdukKosikCislo();
    zboziNactiAjax();


}

function nastavZpetProdukKosikCislo()
{
    console.log("nastavZpetProdukKosikCislo");
    $('#ulVybratSvacu').find('.produktKosikCislo').html("Přidat do<br>košíku");
    $('#ulVybratSvacu').find('.produktKosikCislo').attr('class', 'produktKosik produktKosikObr');
}

function prihlaseniZobrazDialog()
{

    //prihlaseniAjax();
    transition("#page-prihlaseni","fade");

}

function prihlaseniAjax()
{
    console.log("prihlaseniAjax");
// TODO vymazat heslo z input field
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/login?username=' + $('#prihlaseniJmeno').val() + '&password='+$('#prihlaseniHeslo').val(),
        success : function (data) {
            console.log("prihlaseniAjax succes");
        if( data.status == "ok")
        {
            console.log("prihlaseni ok");
            alert("přihlášen ok");
            //transition("#page-dokoncitPlatbuPozitivni","fade");
            transition("#page-vybratSvacu","fade");
            nacistDataPoPrihlaseni


        }
        else
        {
            alertZobraz(data.msg);
        }
        },
        error: ajaxError2
    });


}

function logout()
{
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/logout' }).done(function(data) {

    });


}



function registrovatAjax() {
    if(validateRegistrace())
    {
        $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/registerUser?username=' + $('#registraceUsername').val() + '&firstName='+$('#registraceJmeno').val()+ '&lastName='+$('#registracePrijmeni').val()+ '&password='+$('#registraceHeslo').val()+ '&email='+$('#registraceEmail').val(),
            success: function(data) {
                if( data.status == "error")
                {
                    //ajaxError2(data);
                    alertZobraz(data.msg);
                    return;
                }
                if( data.status == "ok")
                {
                    alert("Zaregistrováno!");
                    nacistDataPoPrihlaseni();
                    transition("#page-vybratSvacu","fade");

                }
            },
            error: ajaxError2


        });
    }
}

function zboziNactiAjax() {
    console.log("zboziNactiAjax");
    $.ajax({ url:'http://demo.livecycle.cz/fajnsvaca/api/listProducts',
        success: function(data) {
            console.log("zboziNactiAjax success");
            if( data.status == "error" && data.code == "not logged")
            {
                console.log(data.msg);
                console.log("neprihlasen");
                prihlaseniZobrazDialog();
                return;
            }
            if( data.status == "error")
            {
                ajaxError2(data);
                return;
            }
            if( data.status == "ok")
            {

                nactiZbozi(data);
            }
        },
        error: ajaxError2


    });
}

function checkBoxProduktTyp(cb)
{
    var currentId = $(cb).attr('id');
    currentId = currentId.replace("CheckboxInput","")
    console.log(currentId);
    if(cb.checked) $('.'+currentId).css('display','block');
    else $('.'+currentId).css('display','none');
    //$('.'+currentId).toggle();
}

function nactiZbozi(data) {
    //var data2 = jQuery.parseJSON({"status":"ok","categories":[{"id":"1","icon":"products/productsHousky.png","name":"Housky"},{"id":"2","icon":"products/productsBagety.png","name":"Bagety"}],"products":[{"id":"1","icon":"products/productsSekanaVHousce.png","price":"29","name":"Sekaná v housce","category_id":"0"},{"id":"2","icon":"products/productsRyzekVHousce.png","price":"33","name":"Řízek v housce","category_id":"0"},{"id":"3","icon":"products/productsSyrVHousce.png","price":"30","name":"Smažený sýr v housce","category_id":"0"},{"id":"4","icon":"products/productsVegetBageta.png","price":"35","name":"Klobásky v housce","category_id":"0"},{"id":"5","icon":"products/productsOblozenaBageta.png","price":"43","name":"Obložená bageta","category_id":"0"},{"id":"6","icon":"products/productsVegetBageta.png","price":"38","name":"Vegetariánská bageta","category_id":"0"}]}');
    zbozi = data.products;
    kategorie = data.categories;
    //kategorie = jQuery.parseJSON('[{"id":"0","icon":"products/productsHousky.png","name":"Housky"},{"id":"2","icon":"products/productsBagety.png","name":"Bagetyy"}]');
    var kategorieIndex = 0;
    console.log("zbozi");
    //zbozi = jQuery.parseJSON( '[{"id":"1","icon":"bageta.jpg","price":"47","name":"Bageta","category_id":"0"},{"id":"2","icon":"chleba.jpg","price":"21","name":"Chleba","category_id":"0"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"}]' );
    //zbozi = jQuery.parseJSON( '[{"id":"1","icon":"bageta.jpg","price":"47","name":"Bageta","category_id":"0"},{"id":"2","icon":"chleba.jpg","price":"21","name":"Chleba","category_id":"0"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"},{"id":"3","icon":"susenky.jpg","price":"12","name":"Sušenky","category_id":"1"}]' );
    console.log(kategorie);
    $("#ulVybratSvacu").empty();


// vloz prvni kategorii
    if(kategorie[0].id==zbozi[0].category_id)
    {
        $( "#ulVybratSvacu" ).append( '<li class="produktTyp" style="background-color:'+ kategorie[0].color +'"><img class="produktTypImg" src="'+appPreffix+kategorie[0].icon+'"  ><a href=""><h2>'+kategorie[0].name+'</h2></a><div class="checkBox checkBoxProduktTyp"><input type="checkbox" onclick="checkBoxProduktTyp(this)" checked="checked" value="1" id="'+kategorie[0].name+'CheckboxInput" name="" /><label for="'+kategorie[0].name+'CheckboxInput"></label></div></li>' );
    }

    var poradiZbozi = 1;
    $.each(zbozi, function()
    {
        // vloz kategorii jestli je jina nez doposud
        // najdi kategorii vyhovujici zbozi
        if(kategorie[kategorieIndex].id!=this.category_id)
        {
//console.log("davam kategorii");
            console.log(kategorieIndex);
            console.log(kategorie[kategorieIndex].id);
            while(kategorie[kategorieIndex].id!=this.category_id && kategorieIndex<kategorie.length-1)
            {
                kategorieIndex ++;
            }

            if(kategorie[kategorieIndex].id==this.category_id)
            {
                $( "#ulVybratSvacu" ).append( '<li class="produktTyp" style="background-color:'+ kategorie[kategorieIndex].color +'"><img class="produktTypImg" src="'+appPreffix+kategorie[kategorieIndex].icon+'"  ><a href=""><h2>'+kategorie[kategorieIndex].name+'</h2></a><div class="checkBox checkBoxProduktTyp"><input type="checkbox" onclick="checkBoxProduktTyp(this)" checked="checked" value="1" id="'+kategorie[kategorieIndex].name+'CheckboxInput" name="" /><label for="'+kategorie[kategorieIndex].name+'CheckboxInput"></label></div></li>' );
                console.log("davam");
            }
        }
        // vloz produkt

        if(poradiZbozi != zbozi.length) {
            $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div class="produktLine"></div>  </li>' );
        } else
        // posledni polozka specialni format
        {
            $( "#ulVybratSvacu" ).append( '<li class="produkt '+kategorie[kategorieIndex].name+'"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+this.icon+'"  >  <span class="cena">'+ this.price +' Kč</span>  <h3>' + this.name + '</h3>  <span>'+ this.description+'</span>  </div>  <div style="clear:both"></div>  </li>' );
        }
        poradiZbozi ++;
    });
}


function kosikRefresh() {
    kosikSoucetCeny= 0;
    kosik.sort();
    $("#ulKosik").empty();
    //$( "#ulKosik" ).append( '<li class="produktTyp produktHeaderSpace"><div style="height: 20px"></div></li>' );
    //$( "#ulKosik" ).append( '<li class="listHeader zelena"><h3>Zaplatit sváču</h3></li>' );
    $.each(kosik, function() {
        var zboziIndex = 0;
        for(var i = 0; i< zbozi.length; i++)
        {
            if(zbozi[i].id == this) {
                zboziIndex = i;
            }
        }
        kosikSoucetCeny += Number(zbozi[zboziIndex].price);
        $( "#ulKosik" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr modra" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</div><div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' +zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div>  <div class="produktLine"></div>  </li>' );
        // old $( "#ulKosik" ).append( '<li class="produkt"><a class="produktKosik produktKosikObr blueOblibene" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</a><a class="produktPopis" href="#">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+zbozi[zboziIndex].price+' Kč</span>  <h3>'+zbozi[zboziIndex].name+'</h3>  <span>'+zbozi[zboziIndex].description+'</span>  </a>  <div class="produktLine"></div>  </li>' );
    });

    $( "#kosikSoucetCenyH" ).text("Celkem " + kosikSoucetCeny + " Kč");
}

function zboziOblibneRefresh() {
    zboziOblibene.sort();
    $("#ulMojeOblibene").empty();
    for(var j = 0; j< zboziOblibene.length; j++)
    {
    //$.each(zboziOblibene, function() {
        var zboziIndex = 0;
        for(var i = 0; i< zbozi.length; i++)
        {
            if(zbozi[i].id == zboziOblibene[j]) {
                zboziIndex = i;
            }
        }

        if(j<zboziOblibene.length-1)
        {
            $( "#ulMojeOblibene" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div>  <div class="produktLine"></div>  </li>' );
        } else
        {
            // posledni polozka specialni format
            $( "#ulMojeOblibene" ).append( '<li class="produkt"><div class="produktKosik produktKosikObr" onclick="kosikAdd(this,'+this.id+')">Přidat do<br>košíku</div>  <div class="produktPopis" href="">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+ zbozi[zboziIndex].price +' Kč</span>  <h3>' + zbozi[zboziIndex].name + '</h3>  <span>'+ zbozi[zboziIndex].description+'</span>  </div><div></div>   </li>' );
        }

        // old $( "#ulKosik" ).append( '<li class="produkt"><a class="produktKosik produktKosikObr blueOblibene" onclick="zboziOblibeneAdd('+this+')">Přidat do<br>oblíbených</a><a class="produktPopis" href="#">  <img src="'+appPreffix+zbozi[zboziIndex].icon+'"  >  <span class="cena">'+zbozi[zboziIndex].price+' Kč</span>  <h3>'+zbozi[zboziIndex].name+'</h3>  <span>'+zbozi[zboziIndex].description+'</span>  </a>  <div class="produktLine"></div>  </li>' );
    }
}

function objednavkaOdelsatAjax(objednavka, typ) {
    console.log("objednavkaOdelsatAjax typ:" + typ);

    //kontrola checkBoxu (budoucich radio buttonu)
     if( $('#checkBoxVyzvednout').is(':checked')==false && $('#checkBoxDonaskaKuryrem').is(':checked')==false && typ==1)
     {
         alertZobraz("Vyberte způsob doručení");
         return;
     }


    $.ajax({
        type: 'POST',
        url: 'http://demo.livecycle.cz/fajnsvaca/api/createOrder?proceed='+typ+'&basket='+objednavka,
        data : objednavka,
        success : function(data) {
            console.log("objednavkaOdelsatAjax typ:" + typ + " success");

            if( data.status == "error" && data.code == "not logged")
            {
                console.log("objednavkaOdelsatAjax data.msg:" + data.msg);
                alertZobraz(data.msg);
                prihlaseniZobrazDialog();
                return;
            }
            if( data.status == "error" && data.code == "notBalance")
            {
                console.log("objednavkaOdelsatAjax data.msg:" + data.msg);
                $('#dokoncitObjednavkuVyse').text(kosikSoucetCeny + " Kč");
                $('#okoncitObjednavkuKredit').text(data.balanceBefore==null?"0 Kč":(data.balanceBefore+" Kč"));
                $('#okoncitObjednavkuZustatek').text(data.balanceAfter==null?"0 Kč":(data.balanceAfter+" Kč"));
                $('#dokoncitPlatbuNegativniText').css("display","block");
                $('#dokoncitPlatbuDobitButton').css("display","block");
                $('#dokoncitPlatbuPozitivniText').css("display","none");
                $('#dokoncitPlatbuPotvrditButton').css("display","none");
                transition("#page-dokoncitPlatbuPozitivni","fade");
                return;
            }

            if(typ==0) {
                // TODO zjistit jeslti je ok
                if(data.status=="ok")
                {
                    $('#dokoncitObjednavkuVyse').text(kosikSoucetCeny + " Kč");
                    $('#okoncitObjednavkuKredit').text(data.balanceBefore==null?"0 Kč":(data.balanceBefore+" Kč"));
                    $('#okoncitObjednavkuZustatek').text(data.balanceAfter==null?"0 Kč":(data.balanceAfter+" Kč"));
                    $('#dokoncitPlatbuPozitivniText').css("display","block");
                    $('#dokoncitPlatbuPotvrditButton').css("display","block");
                    $('#dokoncitPlatbuNegativniText').css("display","none");
                    $('#dokoncitPlatbuDobitButton').css("display","none");
                    transition("#page-dokoncitPlatbuPozitivni","fade");
                } else
                {
                    // TODO dodelat negativni stranku
                    //transition("#page-dokoncitNegativnii","fade");
                }

            }
            if(typ==1) {
                // TODO dokoncit negativni cast
                if(data.status=="ok")
                {
                    $('#potvrzeniPlatbyKredit').text(data.balanceAfter==null?"0 Kč":("Kredit: " + data.balanceAfter + " Kč"));
                    transition("#page-potvrzeniPlatby","fade");
                    /*
                    kosik = [];
                    kosikRefresh();
                    kosikPocetPolozek = 0;
                    kosikZobrazCisloVkolecku();
                    */
                    nacistDataPoPrihlaseni();
                }

            }
            if(data.status=="error")
            {
                //alertZobraz(data.msg);
                console.log(data);
                console.log(data.msg);
            }
        },
        error: ajaxError2
    });



    return;
}

function objednavkaProceed() {
    if(kosik.length == 0)
    {
        alertZobraz("Košík je prázdný, nelze objednat.");
        return;
    }
    console.log("vytvarim objednavku");
    objednavka = "";
    kosik.sort();
    var pocet = 1;
    for(var i = 0; i< kosik.length; i++)
    {
        if(kosik[i] == kosik[i+ 1]){
            pocet ++;
        }
        else
        {
            if(objednavka.length > 0) {
                objednavka += ",";
            }
            objednavka += + String(kosik[i]) + ":" + String(pocet);
            pocet = 1;
        }

    }
    console.log(objednavka);
    //transition("#page-dokoncitPlatbuPozitivni","fade");
    objednavkaOdelsatAjax(objednavka,0);

}


function alertZobraz(msg) {
    alert(msg);
}


// =============================================================================== validace poli
var nepovoleneZnaky = "";

function validateDo(k) {
    // TODO regularni vyraz
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
}

// validace znaku
function validateKeyCharacters(e) {
    var k;
    document.all ? k = e.keyCode : k = e.which;
    return validateDo(k)
}

// validace vlozeneho textu
function validateCharacters(e) {
    if(!validateCharactersDo(e))
    {
        alert("Text obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
}

function validateCharactersDo(e) {
    nepovoleneZnaky = "";
    var validnost = true;
    if(e==null) return;
    for(var i=0; i<e.length;i++)
    {
        //alert("kontroluji:" + e.substring(i,i+1));
        //alert(validateKeyCharacters(e.substring(i,i+1)));
        var k = e.substring(i,i+1).charCodeAt(0);
        if(!validateDo(k))
        {
            nepovoleneZnaky += e.substring(i,i+1);
        }
    }
    //alert(e);
    if(nepovoleneZnaky!="")
    {
        //alert("Text obsahuje nepovolené znaky: " + nepovoleneZnaky);
        validnost = false;
    }
    return validnost;
}



// validace password poli po vlozeni
function validatePassword(e) {
    if(!validatePasswordDo(e))
    {
        alert("Hesla se neshoduji!");
    }
}

function validatePasswordDo(e) {
    var validnost = true;
    // validnost textu
    if(e==null) return true;
    if(validateCharactersDo(e))
    {
        // reseni shody hesel
        if($( "#registraceHeslo2" ).val() !="")
        {
            if($("#registraceHeslo").val() != $("#registraceHeslo2").val())
            {
                validnost = false;
            }
        }
    } else
    {
        validnost = false;
    }
    return validnost;

}

// validace polí registrace
function validateRegistrace() {
    var validnost = true;
    if(!validateCharactersDo($("#registraceUsername").val()))
    {
        validnost = false;
        alertZobraz("Přihlašovací jméno obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
    if(!validateCharactersDo($("#registraceJmeno").val()) && validnost)
    {
        validnost = false;
        alertZobraz("Jméno obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }

    if(!validateCharactersDo($("#registracePrijmeni").val()) && validnost)
    {
        validnost = false;
        alertZobraz("Příjmení obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }

    if(!validateCharactersDo($("#registraceHeslo").val()) && validnost)
    {
        validnost = false;
        alertZobraz("Heslo obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
    if(!validateCharactersDo($("#registraceHeslo2").val()) && validnost)
    {
        validnost = false;
        alertZobraz("Potvrzení hesla obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
    if(!validatePasswordDo() && validnost)
    {
        validnost = false;
        alertZobraz("Hesla se neshodují");
    }
    if(($( "#registraceHeslo" ).val() =="") && validnost)
    {
        validnost = false;
        alertZobraz("Heslo je prázdné");
    }
    if(($( "#registraceHeslo2" ).val() =="") && validnost)
    {
        validnost = false;
        alertZobraz("Potvrzení hesla je prázdné");
    }

    if(!validateCharactersDo($("#registraceEmail").val()) && validnost)
    {
        validnost = false;
        alertZobraz("E-mail obsahuje nepovolené znaky: " + nepovoleneZnaky);
    }
    return validnost;

}