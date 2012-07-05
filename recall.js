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

        var show = function(){
            sandbox.find()[0].hidden = false;
            return false;
        };

        var hide = function(){
            sandbox.find()[0].hidden = true;
            return false;
        };
        return function(sandbox_){
            sandbox = sandbox_;
            $('#about-carousel').carousel({interval: 5000});
            sandbox.subscribe("show-about", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "verify-email-form",
    function(){
        var sandbox;

        var verify = function(){
            var button = sandbox.find("#v-e-submit")[0];
            button.classList.add("disabled");
            button.textContent = "Verifying...";

            var matches = document.documentURI.match(/email_key=[0-9\-a-f]{36}/);
            var email_key = matches[0].slice(10);

            sandbox.publish(
            "verify-email", {
                "email_key": email_key,
                "email": sandbox.find("#v-e-email")[0].value,
                "password": sandbox.find("#v-e-password")[0].value,
                "success": function(){
                    sandbox.publish("show-post-login");
                },
                "failure": failure
            });
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

        var failure = function(){
            var button = sandbox.find("#v-e-submit")[0];
            button.textContent = "Try Again";
            button.classList.remove("disabled");
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.bind("#v-e-submit", "click", verify);
            sandbox.subscribe("show-verify-email-form", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "request-invite-form",
    function(){
        var sandbox;

        var typeShowing = "#r-i-real-name";

        var send = function(){
            var button = sandbox.find("#r-i-submit")[0];
            button.classList.add("disabled");
            button.textContent = "Sending...";

            var data = {};

            data.email = sandbox.find("#r-i-email")[0].value;
            if (data.email.indexOf("@") === -1){
                failure();
                return false;
            }

            var typeSelect = sandbox.find("#r-i-type")[0];
            if (typeSelect.selectedIndex === 0){
                data.firstName = sandbox.find("#r-i-first-name")[0].value;
                data.surname = sandbox.find("#r-i-surname")[0].value;
                if (data.firstName === "" || data.surname === ""){
                    failure();
                    return false;
                }
            } else if (typeSelect.selectedIndex === 1){
                data.pseudonym = sandbox.find("#r-i-pseudonym")[0].value;
                if (data.pseudonym === ""){
                    failure();
                    return false;
                }
            }

            sandbox.asynchronous(
                function(status, content){
                    if(status !== 202){
                        failure();
                    } else {
                        success();
                    }
                },
                "post",
                recall_config["api-base-url"] + "/user",
                JSON.stringify(data),
                "application/json"
                );
            return false;
        };

        var success = function(){
            var button = sandbox.find("#r-i-submit")[0];
            button.textContent = "Sent!";
        };

        var failure = function(){
            var button = sandbox.find("#r-i-submit")[0];
            button.textContent = "Try Again (after filling out all fields)";
            button.classList.remove("disabled");
        };

        var changeType = function(event){
            var realNameID = "#r-i-real-name";
            var pseudonymID = "#r-i-pseudonym-div";
            if (typeShowing === realNameID){
                sandbox.find(realNameID)[0].hidden = true;
                sandbox.find(pseudonymID)[0].hidden = false;
                typeShowing = pseudonymID;
            } else if (typeShowing === pseudonymID){
                sandbox.find(pseudonymID)[0].hidden = true;
                sandbox.find(realNameID)[0].hidden = false;
                typeShowing = realNameID;
            }
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.bind("#r-i-submit", "click", send);
            sandbox.bind("#r-i-type", "change", changeType);
        };
    }());

core.add(
    "view",
    function()
    {
        var sandbox;

        var hadAuthLastTime = false;

        var search = function(event){
            var displayMarks = function(marks){
                sandbox.deleteContentsOf("#list-of-marks");
                for (var i = 0; i < marks.length; i++){
                    sandbox.append("#list-of-marks", markToElement(marks[i]));
                }
            };
            sandbox.publish("get-marks?",
                            { "q": sandbox.find("#v-search-field")[0].value,
                              "callback": displayMarks });
            return false;
        };

        var humanTime = function(unixtime){
            var then = new Date(unixtime * 1000);
            return $.timeago(then); // FIXME
        };

        var markToElement = function(mark){
            if (mark.hasOwnProperty("hyperlink")){
                var template = sandbox.find("#hyperlink-template")[0];
                var hyperlink = template.cloneNode(true);
                hyperlink.id = "mark-" + mark["@"] + "-" + mark["~"];
                sandbox.offdom.find(hyperlink, ".who")[0].textContent = mark["@"];
                sandbox.offdom.find(hyperlink, ".hyperlink-url")[0].href = mark.hyperlink;
                sandbox.offdom.find(hyperlink, ".hyperlink-title")[0].textContent = mark.title;
                sandbox.offdom.find(hyperlink, ".when")[0].textContent = humanTime(mark["~"]);
                return hyperlink;
            } else if (mark.hasOwnProperty("#")) {
                var comment = sandbox.find("#comment-template")[0].cloneNode(true);
                comment.id = "mark-" + mark["@"] + "-" + mark["~"];
                sandbox.offdom.find(comment, ".who")[0].textContent = mark["@"];
                sandbox.offdom.find(comment, ".what")[0].textContent = mark["#"];
                sandbox.offdom.find(comment, ".when")[0].textContent = humanTime(mark["~"]);
                return comment;
            }
        };

        var show = function(){
            sandbox.find()[0].hidden = false;
            return false;
        };

        var hide = function(){
            sandbox.find()[0].hidden = true;
            return false;
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("show-view", show);
            sandbox.subscribe("hide-all", hide);
            sandbox.bind("#v-search-button", "click", search);
        };
    }());

core.add(
    "import-bookmarks",
    function(){
        var sandbox;

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

        var importBookmarks = function(){
            var button = sandbox.find("#m-i-import")[0];
            button.classList.add("disabled");
            button.textContent = "Importing...";
            var bookmarksFile = $("#m-i-bookmarks-file-input")[0].files[0];
            var reader = new FileReader();
            reader.onload = function(event){
                var contents = event.target.result;
                var bookmarkRegex = /<[Aa][\W|\w]+?[Aa]>/gi;
                var matches = contents.match(bookmarkRegex);
                var bookmarks = [];
                for (var each in matches){
                    var dom = HTMLtoDOM(matches[each]);
                    var element = $(dom).find("a")[0];
                    var bookmark = netscapeElementToMark(element);
                    if (bookmark){
                        bookmarks.push(bookmark);
                    }
                }
                sandbox.publish("new-marks", bookmarks);
                button.textContent = "Imported!";
            };
            reader.readAsText(bookmarksFile, "UTF-8");
            return false;
        };

        var hide = function(){
            sandbox.find()[0].hidden = true;
            return false;
        };

        var show = function(success){
            sandbox.find()[0].hidden = false;
            return false;
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("hide-all", hide);
            sandbox.subscribe("show-import-bookmarks", show);
            sandbox.bind("#m-i-import", "click", importBookmarks);
        };
    }());

core.add(
    "problem-box",
    function(){
        var sandbox;

        var info = function(message){
            var infobox = sandbox.find("#info-template")[0].cloneNode(true);
            infobox.id = undefined;
            infobox.hidden = false;
            infobox.classList.add("alert-success");
            sandbox.offdom.find(infobox, ".info-contents")[0].textContent = message;
            sandbox.append(infobox);
        };

        var error = function(message){
            var infobox = sandbox.find("#info-template")[0].cloneNode(true);
            infobox.id = undefined;
            infobox.hidden = false;
            infobox.classList.add("alert-error");
            sandbox.offdom.find(infobox, ".info-contents")[0].textContent = message;
            sandbox.append(infobox);
        };

        return function(sandbox_){
            sandbox = sandbox_;
            sandbox.subscribe("info", info);
            sandbox.subscribe("error", error);
        };
    }());

core.add(
    "bookmarklet",
    function(){
        var sandbox;

        var insertJavasciptLink = function(){
            var insert = function(status, content){
                var bookmarkletAnchor = sandbox.find("#bookmarklet-a")[0];
                var url = "javascript:" + content.replace(
                    "WWW_BASE_URL", recall_config["www-base-url"]);
                bookmarkletAnchor.href = url;
            };

            var trampolineURL = recall_config["www-base-url"] + "/bookmarklet-trampoline";
            
            sandbox.asynchronous(
                insert,
                "get",
                trampolineURL
            );
        };

        var hide = function(){
            sandbox.find()[0].hidden = true;
            return false;
        };

        var show = function(){
            sandbox.find()[0].hidden = false;
            return false;
        };
        
        return function(sandbox_){
            sandbox = sandbox_;
            insertJavasciptLink();
            sandbox.subscribe("show-bookmarklet", show);
            sandbox.subscribe("hide-all", hide);
        };
    }());

core.add(
    "navbar",
    function(){
        var sandbox;

        var previousMode;

        var moveTo = function(show){
            sandbox.set("last-show", show);
            sandbox.publish("hide-all");
            sandbox.publish("show-" + show);

            var allNavbarLinks = sandbox.find(".show");
            for (var i = 0; i<allNavbarLinks.length; i++){
                allNavbarLinks[i].classList.remove("active");
            }

            var navbarLinkForNewShow = sandbox.find("#show-" + show);
            if (navbarLinkForNewShow.length !== 0){
                navbarLinkForNewShow[0].classList.add("active");
            }
        };

        var navbarMode = function(mode){
            if (mode === "visitor"){
                if(previousMode){
                    sandbox.hiddenWrapHack(".navbar-" + previousMode);
                }
                sandbox.unHiddenWrapHack(".navbar-visitor");
            } else if (mode === "user"){
                if(previousMode){
                    sandbox.hiddenWrapHack(".navbar-" + previousMode);
                }
                sandbox.unHiddenWrapHack(".navbar-user");
            }
            previousMode = mode;
        };

        var setVersion = function(){
            var set = function(status, content){
                if (status !== 200){
                    version = "Development Version";
                } else {
                    version = "Version " + content;
                }
                sandbox.find("#recall-version")[0].textContent = version;         
            };
            sandbox.asynchronous(set, "get", recall_config["www-base-url"] + "/version");
        };

        var logout = function(){
            sandbox.publish("logout");
            moveTo("about");
            navbarMode("visitor");
            localStorage.clear();
        };

        return function(sandbox_){
            sandbox = sandbox_;
            setVersion();
            var show = sandbox.get("last-show");
            if (show === null){
                show = "about";
            }
            if (document.documentURI.match("email_key")){
                show = "verify-email-form";
            }
            moveTo(show);
            sandbox.bind(".show", "click", function(event){
                             moveTo(event.currentTarget.id.slice(5));
                         });
            sandbox.publish("logged-in?",
                            {"success": function(){ navbarMode("user");},
                             "failure": function(){ navbarMode("visitor");}
                             });
            sandbox.bind("#logout", "click", logout);
            sandbox.subscribe("login", function(){ navbarMode("user");});
            sandbox.subscribe("show-post-login", function(){
                                  moveTo("view");
                              });
        };
    }());