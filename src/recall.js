// Recall is a program for storing bookmarks of different things
// Copyright (C) 2012  Cal Paterson

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

core.add(
    "about",
    function(){
        var sandbox;

	var scrolledDownBefore = false;

	var oldOnScroll = null;
	
        var show = function(){
	    sandbox.show()
	    oldOnScroll = window.onscroll;
	    window.onscroll = function(event){
		if (!scrolledDownBefore){
		    var scrollTop = document.documentElement.scrollTop + document.body.scrollTop;
		    var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		    var scrollDistance = (scrollTop / height) * 100;
		    if(scrollDistance > 60){
			mixpanel.track("Read 60% of About Page");
			scrolledDownBefore = true;
		    }
		}
	    };
            return false;
        };

        var hide = function(){
	    window,onscroll = oldOnScroll;
	    sandbox.hide();
            return false;
        };
        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("show-about", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "footer",
    function(){
	var sandbox;

	return function(sandbox_){
	    sandbox = sandbox_;
	    sandbox.bind("#i-imprint", "click", function(){
		sandbox.publish("show-imprint")
	    });
	    sandbox.bind("#i-privacy-policy", "click", function(){
		sandbox.publish("show-privacy-policy")
	    });
	    sandbox.bind("#i-terms-and-conditions", "click", function(){
		sandbox.publish("show-terms-and-conditions")
	    });
	}
    }());

core.add(
    "imprint",
    function(){
	var sandbox;
	var show = function(){
	    sandbox.publish("hide-all");
	    sandbox.show();
	    return false;
	};

	var hide = function(){
	    sandbox.hide();
	    return false;
	};

	return function(sandbox_){
	    sandbox = sandbox_;
	    sandbox.subscribe("hide-all", hide)
	    sandbox.subscribe("show-imprint", show);
	};
    }());

core.add(
    "privacy-policy",
    function(){
	var sandbox;
	var show = function(){
	    sandbox.publish("hide-all");
	    sandbox.show();
	    return false;
	};

	var hide = function(){
	    sandbox.hide();
	    return false;
	};

	return function(sandbox_){
	    sandbox = sandbox_;
	    sandbox.subscribe("hide-all", hide)
	    sandbox.subscribe("show-privacy-policy", show);
	};
    }());

core.add(
    "terms-and-conditions",
    function(){
	var sandbox;
	var show = function(){
	    sandbox.publish("hide-all");
	    sandbox.show();
	    return false;
	};

	var hide = function(){
	    sandbox.hide();
	    return false;
	};

	return function(sandbox_){
	    sandbox = sandbox_;
	    sandbox.subscribe("hide-all", hide)
	    sandbox.subscribe("show-terms-and-conditions", show);
	};
    }());

core.add(
    "verify-email",
    function(){
        var sandbox;

        var token;

        var verify = function(){
            var button = sandbox.find("#v-e-submit")[0];
	    sandbox.addClass(button, "disabled");
            button.textContent = "Verifying...";

            sandbox.publish(
            "verify-email", {
                "email_key": token,
                "email": sandbox.find("#v-e-email")[0].value + "@" + recall_config["shadowEmailDomain"],
                "password": sandbox.find("#v-e-password")[0].value,
                "success": function(){
                    sandbox.publish("show-post-login");
                },
                "failure": failure
            });
            return false;
        };

        var show = function(data){
	    sandbox.show()
            token = data.split("/")[2];
            return false;
        };

        var hide = function(){
	    sandbox.hide()
            return false;
        };

        var failure = function(){
            var button = sandbox.find("#v-e-submit")[0];
            button.textContent = "Try Again";
	    sandbox.removeClass(button, "disabled");
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.bind("#v-e-submit", "click", verify);
            sandbox.subscribe("show-verify-email", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "checked-out",
    function(){
	var sandbox;

	var show = function(){
	    mixpanel.track("Paid");
	    var details = sandbox.get("details");
	    sandbox.asynchronous(
                function(status, content){
		    if(status !== 202){
                        failure("Unable to send signup details");
		    } else {
			success();
		    }
                },
                "post",
                sandbox.api() + "/people/" + details.email + "/",
                JSON.stringify(details),
                null,
                {"Content-Type": "application/json"}
            );
	};

	var failure = function(){};

	var success = function(){
	    sandbox.show();
	};

	var saveDetails = function(message){
	    sandbox.set("details", message);
	}


        return function(sandbox_){
            sandbox = sandbox_;
	    sandbox.subscribe("subscription-details", saveDetails);
	    sandbox.subscribe("show-checked-out", show);
        };
    }());

core.add(
    "request-invite-form",
    function(){
        var sandbox;

        var typeShowing = "#r-i-real-name";

        var subscribe = function(){
            var button = sandbox.find("#r-i-submit")[0];
	    sandbox.addClass(button, "disabled");
            button.textContent = "Sending...";

            var data = {};

            data.private_email = sandbox.find("#r-i-email")[0].value;
            if (data.private_email.indexOf("@") === -1){
                failure("Need a valid email address", true);
                return false;
            }

            var typeSelect = sandbox.find("#r-i-type")[0];
            if (typeSelect.selectedIndex === 0){
                data.firstName = sandbox.find("#r-i-first-name")[0].value;
                data.surname = sandbox.find("#r-i-surname")[0].value;
		data.email = (data.firstName + "." + data.surname +
			      "@" + recall_config["shadowEmailDomain"]).toLowerCase();
                if (data.firstName === "" || data.surname === ""){
                    failure("Need a first name and a surname", true);
                    return false;
                }
            } else if (typeSelect.selectedIndex === 1){
                data.pseudonym = sandbox.find("#r-i-pseudonym")[0].value;
		data.email = (data.pseudonym +
			      "@" + recall_config["shadowEmailDomain"]).toLowerCase();
                if (data.pseudonym === ""){
                    failure("Need a psuedonym", true);
                    return false;
                }
            }

	    mixpanel.track("Subscribe");
	    sandbox.publish("subscription-details", data);
	    sandbox.hide("#details-form");
	    sandbox.show("#paypal-form");
            return false;
        };

        var failure = function(reason, canRetry){
            var button = sandbox.find("#r-i-submit")[0];
	    sandbox.addClass(button, "btn-danger");
	    if(typeof(reason) === "string"){
		button.textContent = reason;
	    } else {
		button.textContent = "Error (try again?)";
	    }
	    if(canRetry){
		sandbox.removeClass(button, "disabled");
	    }
        };

        var changeType = function(event){
            var realNameID = "#r-i-real-name";
            var pseudonymID = "#r-i-pseudonym-div";
	    sandbox.hide(typeShowing);
	    if (typeShowing === realNameID){
		typeShowing = pseudonymID;
	    } else {
		typeShowing = realNameID;
	    }
	    sandbox.show(typeShowing);
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.bind("#r-i-submit", "click", subscribe);
            sandbox.bind("#r-i-type", "change", changeType);
        };
    }());

var bookmarkToElement = function(mark, sandbox){
    var domain = function(hyperlink){
	return hyperlink.match("[^/]+//w?w?w?[\.]?([^\/:]+)")[1]
    }
    var template = document.querySelector("#hyperlink-template");
    var hyperlink = template.cloneNode(true);
    hyperlink.id = "mark-" + mark["@"] + "-" + mark["~"];
    sandbox.offdom.find(hyperlink, ".hyperlink-url")[0].href = mark.hyperlink;
    sandbox.offdom.find(hyperlink, ".hyperlink-title")[0].textContent = mark.title;
    sandbox.offdom.find(hyperlink, ".hyperlink-domain")[0].textContent = domain(mark.hyperlink);
    return hyperlink;
};

var humanTime = function(then){
    var then_ = new Date(then * 1000);
    return then_.toLocaleTimeString() +
	" - " + then_.toLocaleDateString();
};

core.add(
    "search",
    function()
    {
        var sandbox;

        var hadAuthLastTime = false;

        var search = function(event){
            var button = sandbox.find("#v-search-button")[0];
	    sandbox.addClass(button, "disabled");
            button.textContent = "Searching...";
            var displayMarks = function(marks){
                sandbox.deleteContentsOf("#list-of-marks");
                if(marks.length > 1){
                    for (var i = 0; i < marks.length; i++){
                        sandbox.append(
			    "#list-of-marks",
			    bookmarkToElement(marks[i], sandbox));
                    }
		    sandbox.removeClass(button, "disabled");
                    button.textContent = "Seach Again?";
                } else {
		    sandbox.removeClass(button, "disabled");
                    button.textContent = "No results!";
                }

            };
            sandbox.publish("get-marks?",
                            { "q": sandbox.find("#v-search-field")[0].value,
                              "callback": displayMarks });
            return false;
        };

        var show = function(){
	    sandbox.show()
            return false;
        };

        var hide = function(){
	    sandbox.hide()
            return false;
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("show-search", show);
            sandbox.subscribe("hide-all", hide);
            sandbox.bind("#v-search-button", "click", search);
        };
    }());

core.add(
    "recent",
    function(){
        var sandbox;

	var getRecentBookmarks = function(){
	    var email = null;
	    var password = null;
	    sandbox.publish("logged-in?", {"success":
					   function(email_, password_){
					       email = email_;
					       password = password_;
					   }});
	    var url = sandbox.api()
		+ "/bookmarks/" + email + "/all/recent/";
            sandbox.asynchronous(
                function(status, content, headers){
                    var bookmarks = JSON.parse(content);
		    var totalBookmarks = parseInt(headers["X-Recall-Total"], 10);
		    var current = totalBookmarks;
		    sandbox.deleteContentsOf("#list-of-recent-bookmarks");
		    for (var i = 0; i < bookmarks.length; i++){
			var li = bookmarkToElement(bookmarks[i], sandbox);
			li.setAttribute("value", current);
			current -= 1;
                        sandbox.append("#list-of-recent-bookmarks", li);
                    }
                },
                "get",
                url,
		{},
                null,
                {"X-Email": email,
                 "X-Password": password,
                 "Content-Type": "application/json"});
	}

        var show = function(){
	    getRecentBookmarks()
	    sandbox.show()
            return false;
        };

        var hide = function(){
	    sandbox.hide()
            return false;
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("show-recent", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "getting-started",
    function(){
        var sandbox;

	var email, password;

        var hide = function(){
	    sandbox.hide()
            return false;
        };

        var show = function(){
	    sandbox.show()
            return false;
        };
        var netscapeElementToMark = function(element, email){
            var htmlDecode = function(text){
                var div = document.createElement("div");
                div.innerHTML = text;
                return div.textContent;
            };
            if (!element.attributes.hasOwnProperty("ADD_DATE")){
                // This is not a bookmark, or the bookmark has no date
                return null;
            }
            var mark = {
                "hyperlink": element.attributes.HREF.nodeValue,
                "~": parseInt(element.attributes.ADD_DATE.nodeValue, 10),
                "title": htmlDecode(element.textContent),
                "@": localStorage.getItem("authorisationService$email") // FIXME: hack
            };
            if (element.attributes.hasOwnProperty("PRIVATE")){
                if (element.attributes.PRIVATE.nodeValue === "1"){
                    mark["%private"] = true;
                }
            }
            if (element.attributes.hasOwnProperty("TOREAD")){
                if (element.attributes.TOREAD.nodeValue === "1"){
                    mark.unread = true;
                }
            }
            if (element.attributes.hasOwnProperty("TAGS")){
                var string = element.attributes.TAGS.nodeValue;
                mark["%tags"] = string.split(/ *, */);
            }
            return mark;
        };

        var authenticate = function(){
            var authentication = function(email_, password_){
                email = email_;
                password = password_;
            };
            sandbox.publish("logged-in?", {"success": authentication,
                                           "failure": function(){}});
        };

        var importBookmarks = function(){
	    // FIXME: Rewrite needed
            var button = sandbox.find("#m-i-import")[0];
	    var failure = function() {
		button.textContent = "Failure - please email your bookmarks to cal@calpaterson.com";
	    }
	    var handler = function (status, content){
		if (status === 202){
		    button.textContent = "Imported";
		} else {
		    failure();
		}
	    };
	    authenticate();
	    sandbox.addClass(button, "disabled");
            button.textContent = "Importing...";
	    if (typeof FileReader === "undefined"){
		failure();
	    } else {
		var bookmarksFile = sandbox.find("#m-i-bookmarks-file-input")[0].files[0];
		var reader = new FileReader();
		reader.onload = function(event){
		    var contents = event.currentTarget.result;
		    sandbox.asynchronous(
			handler,
			"post",
			sandbox.api() + "/bookmarks/" + email + "/",
			contents,
			null,
			{"Content-Type": "text/html",
			 "X-Email": email,
			 "X-Password": password}
		    )
		};
		reader.readAsText(bookmarksFile, "UTF-8");
		return false;
	    }
        };

        var insertJavasciptLink = function(){
            var insert = function(status, content){
                var bookmarkletAnchor = sandbox.find("#bookmarklet-a")[0];
                var url = "javascript:" + content.replace(
                    "WWW_BASE_URL", sandbox.web());
                bookmarkletAnchor.href = url;
            };

            var trampolineURL = sandbox.web() + "/bookmarklet-trampoline";
            
            sandbox.asynchronous(
                insert,
                "get",
                trampolineURL
            );
        };

        return function (sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("show-getting-started", show);
            sandbox.subscribe("hide-all", hide);
            insertJavasciptLink();
            sandbox.bind("#m-i-import", "click", importBookmarks);
        };
    }());

core.add(
    "navigation",
    function(){
        var sandbox;

        var moveTo = function(show){
            sandbox.publish("hide-all");
            sandbox.publish("show-" + show, window.location.pathname);
            if (typeof history !== "undefined" && typeof history.pushState !== "undefined"){
                history.pushState({}, "Recall", "/" + show + "/");
            }
        };

        var vistorModeDisplay = {
            showing: ["#show-login", "#show-about"],
            hiding: ["#show-getting-started", "#show-recent", "#show-search", "#logout"]
        };

        var userModeDisplay = {
            showing: vistorModeDisplay.hiding,
            hiding: vistorModeDisplay.showing
        };

        var flip = function(display){
	    var hiding = display.hiding;
	    var showing = display.showing;
	    for(var i = 0; i<hiding.length; i++){
                sandbox.find(hiding[i])[0].style.display = "none";
            };
	    for(var j = 0; j<showing.length; j++){
                sandbox.find(showing[j])[0].style.display = "";
            };
        };

        var vistorMode = function(){
            flip(vistorModeDisplay);
	    mixpanel.track("Visit", {"Subscriber": false});
        };

        var userMode = function(){
            flip(userModeDisplay);
	    mixpanel.track("Visit", {"Subscriber": true});
        };

        return function(sandbox_){
            sandbox = sandbox_;
            if (window.location.pathname !== "/"){
                moveTo(window.location.pathname.split("/")[1]);
            } else {
                moveTo("about");
            }

            sandbox.bind(".recall-show", "click", function(event){
                moveTo(event.currentTarget.id.slice(5));
            });
            
            sandbox.bind("#logout", "click", function(){
                vistorMode();
                sandbox.publish("logout");
            });
            
            sandbox.subscribe("logged-in", userMode);
            

            sandbox.subscribe("show-post-login", function(){
                moveTo("getting-started");
            });
            
            sandbox.publish("logged-in?", {
                "success": userMode,
                "failure": vistorMode
            });
        };
    }());