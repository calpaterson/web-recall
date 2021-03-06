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
    "bookmarklet",
    function(){
        var sandbox;

        var restoreTabSelection = function(){
            var tabSelection = sandbox.get(
                "bookmarklet-tab-selection");
            if (tabSelection){
                sandbox.addClass(sandbox.find(tabSelection)[0], "active");
                sandbox.addClass(sandbox.find(tabSelection.slice(0, -8))[0], "active");
            } else {
                sandbox.addClass(sandbox.find("#hyperlink-tab-content")[0], "active");
                sandbox.addClass(sandbox.find("#hyperlink-tab")[0], "active");
            }
        };

        var saveTabSelection = function(event){
            var href = event.target.getAttribute("href");
            sandbox.set("bookmarklet-tab-selection", href);
        };

        var preloadHyperlinkTabFields = function(){
            var url = location.href;
            var banana_split = url.split("&");
            for (var i = 1; i < banana_split.length; i++){
                var sub_split = banana_split[i].split("=");
                if (sub_split[0] === "title"){
                    sandbox.find("#hyperlink-title")[0].value = decodeURIComponent(sub_split[1]);
                } else if (sub_split[0] === "url"){
                    sandbox.find("#hyperlink-url")[0].value = decodeURIComponent(sub_split[1]);
                }
            }
        };

        var makeMark = function(event){
            var button = sandbox.find("#mark-button")[0];
	    sandbox.addClass(button, "disabled");
            button.textContent = "Marking...";
            var unixtimeNow = function() {
                return Math.floor(new Date().getTime() / 1000);
            };
            var makeMarkCallback = function(email, password){
                var marks = [];

                var markTime = unixtimeNow();
                var mark = { "~": markTime };
                var private_ = sandbox.find("#private")[0].checked;
                if (private_){
                    mark["%private"] = true;
                }
		if (sandbox.hasClass(sandbox.find("#comment-tab-content")[0], "active")){
                    mark["#"] = sandbox.find("#comment-body")[0].value;
                } else if (sandbox.hasClass(sandbox.find("#hyperlink-tab-content")[0], "active")){
                    mark.title = sandbox.find("#hyperlink-title")[0].value;
                    mark.hyperlink = sandbox.find("#hyperlink-url")[0].value;
                }
                
                mark["@"] = email;
                
                // var factsEntered = sandbox.find("#about-facts")[0].value.split(/ ?, */);
                // if (factsEntered.length === 1 && factsEntered[0] === ""){
                //     factsEntered = [];
                // }
                // var facts = {};
                // var factTime = markTime;
                // for (var i=0; i<factsEntered.length; i++){
                //     factTime += 1;
                //     var fact = { "@": email,
                //                  "~": factTime,
                //                  "about": factsEntered[i],
                //                  ":": {"@": email, "~": markTime}};
                //     if (private_){
                //         fact["%private"] = true;
                //     }
                //     marks.push(fact);
                // }

                var message = {
                    "success": function(){
                        button.textContent = "Marked!";
                        window.close();
                    },
                    "failure": function(){
                        button.textContent = "Failure!";
			sandbox.removeClass(button, "disabled");
                    },
                    "mark": mark
                };
                sandbox.publish("new-mark", message);
            };

            var failure = function(){
                
            };

            sandbox.publish("logged-in?", {
                                "success": makeMarkCallback,
                                "failure": failure});
            return false;
        };

        var show = function(){
            sandbox.find()[0].hidden = false;
            return false;
        };

        var hide = function(){
            sandbox.find()[0].hidden = true;
            return false;
        };

        return function (sandbox_) {
            sandbox = sandbox_;
            restoreTabSelection();
            preloadHyperlinkTabFields();
            sandbox.bind(".tab", "click", saveTabSelection);
            sandbox.bind("#mark-button", "click", makeMark);
            // sandbox.subscribe("mark-sent", function() {window.close();});
            sandbox.subscribe("hide-all", hide);
            sandbox.subscribe("show-bookmarklet", show);
            sandbox.subscribe("show-post-login", show);
            var get = function(key){
                return localStorage.getItem("authorisationService$" + key);
            };
            if (get("email") && get("password")){
                show();
            } else {
                sandbox.publish("show-login");
            }
        };
    }());