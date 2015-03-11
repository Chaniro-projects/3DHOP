var presenter = null;
var data = [];
var currentObject = 0;
var lastProgress = -1;
var lastColor = false;
var blockProgress = -1;

$(document).ready(function () {
    init3dhop();

    var accordionItem = $("#accordion-item").html();
    $.ajax({
        url: "objects.json",
        type: "GET",
        dataType: "text",
        success: function(txt) {
            data = eval(txt);
            for(var i = 0; i<data.length; i++) {
                data[i].scene.trackball.type = eval(data[i].scene.trackball.type);
                var item = $(accordionItem.replace("{{title}}", data[i].name)
                    .replace("{{date}}", data[i].date)
                    .replace("{{lieu}}", data[i].lieu)
                    .replace("{{desc}}", data[i].desc)
                    .replace(/{{idArray}}/g, i)
                    .replace(/{{id}}/g, "collapse" + i));

                if(i == 0)
                    item.children("div.collapse").addClass("in");
                else
                    item.find(".progress").hide();


                if(typeof data[i].scene_c != 'undefined') {
                    item.find(".showObjC").removeClass("hide");
                    data[i].scene_c.trackball.type = eval(data[i].scene_c.trackball.type);
                }
                $("#accordion").append(item);
            }
            $("#accordion").collapse({
                toggle: false
            });

            $(".showObj").click(function() {
                loadObject($(this).attr("data-id"), false);
            });

            $(".showObjC").click(function() {
                loadObject($(this).attr("data-id"), true);
            });

            var obj = data[0];
            obj.scene.onProgress = function(a) {
                onProgress(a, obj.total);
            }
            setup3dhop(obj.scene);
        },
        error : function(resultat, statut, erreur){
            console.log(erreur);
        }
    });

    $( window ).resize(resize);
    resize();
});

function loadObject(id, color) {
    lastColor = color;
    var obj = data[id];
    currentObject = id;
    lastProgress = -1;

    if(blockProgress < 0) {
        $("#progress" + id).children().css("width", "0%").html("0%").attr("aria-valuenow", 0);
        $("#progress" + id).slideDown();
    }

    if(!color) {
        obj.scene.onProgress = function (a) {
            onProgress(a, obj.total);
        }
    }
    else {
        obj.scene_c.onProgress = function (a, b) {
            onProgress(a, b);
        }
    }
    setTimeout(function() {
        setup3dhop(color ? obj.scene_c : obj.scene);
    }, 500);
}

var inter = -1;
function onProgress(a, b) {
    var p = Math.round(a*100/b);
    if(p != lastProgress) {
        lastProgress = p;
        if (p > 100) p = 100;
        var progress = $("#progress" + currentObject);

        if(blockProgress < 0 || p > blockProgress)
            progress.children().css("width", p + "%").html(p + "%").attr("aria-valuenow", p);

        if (inter >= 0)
            clearTimeout(inter);
        inter = setTimeout(function () {
            /*if(lastProgress < 40) {
                console.log("BLOCK: " + lastProgress);
                blockProgress = lastProgress;
                loadObject(currentObject, lastColor);
            }
            else {*/
                blockProgress = -1;
                progress.children().css("width", "100%").html("100%");
                setTimeout(function () {
                    progress.slideUp();
                });
           // }
        }, 1000);
    }
}

function actionsToolbar(action) {
    if(action=='home') presenter.resetTrackball();
    else if(action=='zoomin') presenter.zoomIn();
    else if(action=='zoomout') presenter.zoomOut();
    else if(action=='light' || action=='light_on') { presenter.enableLightTrackball(!presenter.isLightTrackballEnabled()); lightSwitch(); }
    else if(action=='full'  || action=='full_on') fullscreenSwitch();
}

function setup3dhop(scene) {
    presenter = new Presenter("draw-canvas");

    presenter.setScene(scene);
}

function resize() {
    var width = $(".canvas3d").width() - 2*(parseInt($(".canvas3d").css("padding-left").replace("px", "")));
    console.log(width);
    resizeCanvas(width, width/8*6);
}