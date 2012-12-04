core.add(
    "login-form",
    function(){
        var sandbox;
        var button;

        var login = function(){
	    sandbox.addClass(button, "disabled");
            button.textContent = "Logging in...";
            sandbox.publish(
            "login", {
                "email": sandbox.find("#login-form-email")[0].value + "@" + recall_config["shadowEmailDomain"],
                "password": sandbox.find("#login-form-password")[0].value,
                "success": loginSuccess,
                "offline": offline,
                "failure": loginError
            });
            return false;
        };

        var loginSuccess = function(user){
            hide();
            button.textContent = "Login Again";
	    sandbox.removeClass(button, "disabled");
            sandbox.publish("show-post-login");
        };

        var offline = function(user){
            button.textContent = "You are offline";
        };

        var loginError = function(user){
            button.textContent = "Try Again";
	    sandbox.removeClass(button, "disabled");
        };

        var show = function(){
	    sandbox.show()
            return false;
        };

        var hide = function(){
	    sandbox.hide()
            return false;
        };

        var complete = function(message){
            if(message){
                sandbox.publish("info", "Logged in");
            } else {
                sandbox.publish("error", "Wrong password");
            }
        };

        return function(sandbox_){
            sandbox = sandbox_;
            button = sandbox.find("#login-form-submit")[0];
            sandbox.bind("#login-form-submit", "click", login);
            sandbox.subscribe("logged-in", complete);
            sandbox.subscribe("show-login", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());