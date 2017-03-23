Alloy.createController = function(name, args) {

    // create instance to the controller and view
    var controller = new(require("alloy/controllers/" + name))(args);

    // check if we have a view and not just <Alloy/>

    console.log(name);
    
    if (Object.keys(controller.__views).length > 0) {
        var view = controller.getView();

        // initialise Alloy.Controllers
        Alloy.Controllers = Alloy.Controllers || {};

        // handles opening controllers in folders e.g. screens/login
        var path = name.split("/");

        // if we have a path, set name to the last part (controller name)
        if (path.length > 0) name = path[path.length - 1];

        // save the controller to Alloy.Controllers for global access
        if (Alloy.Controllers[name]) {
            console.warn("::AlloyXL:: Alloy.Controllers." + name + " exists, and will be overwriten. You might want to name these differently!");
        }

        Alloy.Controllers[name] = controller;

        // add a once event handler
        controller.once = function(eventName, callback) {
            controller.on(eventName, function() {
                controller.off(eventName);
                callback();
            });
            return controller;
        };

        if (typeof view.addEventListener == "function") {
            if (typeof view.open == "function") {

                // fire an open event on open
                view.addEventListener("open", open = function(e) {
                    view.removeEventListener("open", open);
                    controller.trigger("open", e);
                    if (ENV_DEV) console.log("controller " + name + " was opened");
                });

                // fully clean up the view and controller on close
                view.addEventListener("close", function close(e) {
                    view.removeEventListener("close", close);
                    view = null;
                    Alloy.Controllers[controller.id] = null;
                    delete Alloy.Controllers[controller.id];
                    controller.off();
                    controller.destroy();
                    controller = null;

                    if (ENV_DEV) console.log("Controller " + name + " cleaned up!");
                });

                // fire an open event on open
                view.addEventListener("postlayout", function postlayout(e) {
                    view.removeEventListener("postlayout", postlayout);
                    controller.trigger("postlayout", e);
                    if (ENV_DEV) console.log("controller " + name + " layout finished");
                });

            } else {
                // fire an open event on open
                view.addEventListener("postlayout", function postlayout(e) {
                    view.removeEventListener("postlayout", postlayout);
                    controller.trigger("postlayout", e);
                    if (ENV_DEV) console.log("controller " + name + " layout finished");
                });
            }
        }
    }

    return controller;
};
