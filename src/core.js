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

core = (
    function () {
        var core = {};
        var modules = {};

        core.add = function (moduleName, controller){
            // Add a module
            modules[moduleName] = {
                controller: controller,
                instance: null};
        };
        core.start = function(moduleName){
            // Start a module
            var controller = modules[moduleName].controller;
            modules[moduleName].instance = controller(
                makeSandbox(this, moduleName));
        };
        core.startAll = function(){
            // Start all modules
            for (var moduleName in modules){
                core.start(moduleName);
            }
        };
        core.subscribe = function (moduleName, messageType, handler){
            // Subscribe a module to a message
            if(!modules[moduleName].hasOwnProperty("subscriptions")){
                modules[moduleName].subscriptions = {};
            }
            modules[moduleName].subscriptions[messageType] = handler;

        };
        core.publish = function (messageType, messageData){
            // Publish a message
            for (var moduleName in modules){
                var subscriptions = modules[moduleName].subscriptions;
                for (var subscription in subscriptions){
                    if(subscription === messageType){
                        subscriptions[subscription](messageData);
                    }
                }
            }
        };
        core.dom = {
            // Domain object model
            queryWithin: function(moduleName, selector){
                if (selector !== undefined){
                    return document.querySelectorAll("#" + moduleName + " " + selector);
                } else {
                    return document.querySelectorAll("#" + moduleName);
                }
            },
            bind: function(moduleName, selector, eventName, handler){
                var elements = this.queryWithin(moduleName, selector);
                for (var index = 0; index < elements.length; index++){
                    elements[index]["on" + eventName] = function(event){
			if(typeof event === "undefined"){
			    event = window.event;
			    event.currentTarget = window.event.srcElement;
			}
			handler(event);
			return false;
		    };
                };
            },
	    show: function(moduleName, selector){
		if (selector !== undefined){
		    this.queryWithin(moduleName, selector)[0].style.display = "inline";
		} else {
		    this.queryWithin(moduleName)[0].style.display = "inline";
		}
	    },
	    hide: function(moduleName, selector){
		if (selector !== undefined){
		    this.queryWithin(moduleName, selector)[0].style.display = "none";
		} else {
		    this.queryWithin(moduleName)[0].style.display = "none";
		}
	    },
	    create: function(tagName){
		return document.createElement(tagName);
	    },
            append: function(moduleName, selector, element){
                core.dom.queryWithin(moduleName, selector)[0].appendChild(element);
            },
            deleteContentsOf: function(moduleName, selector){
                var parent = this.queryWithin(moduleName, selector)[0];
                while(parent.hasChildNodes()){
                    parent.removeChild(parent.lastChild);
                }
            },
	    addClass: function(moduleName, element, className){
		if (document.documentElement.classList) {
		    element.classList.add(className);
		} else {
		    if (this.hasClass(element, className)) {
			element.className += (element.className ? " " : "") + className;
		    }
		}
	    },
	    hasClass: function(moduleName, element, className){
		if (document.documentElement.classList) {
		    return element.classList.contains(className);
		} else {
		    if (!element || !element.className) {
			return false;
		    }
		    var re = new RegExp('(^|\\s)' + className + '(\\s|$)');
		    return element.className.match(re);
		}
	    },
	    removeClass: function(moduleName, element, className){
		if (document.documentElement.classList) {
		    element.classList.remove(className);
		} else {
		    var regexp = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
		    element.className = element.className.replace(regexp, "$2");
		}
	    },
            hiddenWrapHack : function(moduleName, selector){
                var elements = this.queryWithin(moduleName, selector);
                for(var index = 0; index < elements.length; index++){
                    elements[index].style.display = "none";
                }
            },
            unHiddenWrapHack : function(moduleName, selector){
                var elements = this.queryWithin(moduleName, selector);
                for(var index = 0; index < elements.length; index++){
                    elements[index].style.display = "block";
                }
            }
        };
        core.offdom = {
            find: function(element, selector){
                return element.querySelectorAll(selector);
            },
	    append: function(element, newChild){
		element.appendChild(newChild);
	    }
        };
        core.asynchronous = function(handler, verb, url, data, mime, headers){
            var request = new XMLHttpRequest();
            request.onload = function(xhrProgressEvent){
		var headers = {};
		var splitByLine = xhrProgressEvent.currentTarget.
		    getAllResponseHeaders().split("\n");
		for(var i = 0; i < splitByLine.length - 1; i++){
		    var locationOfColon = splitByLine[i].indexOf(": ");
		    var key = splitByLine[i].split(": ", 1);
		    if (key === ""){
			continue;
		    }
		    var value = splitByLine[i].slice(locationOfColon + 2);
		    headers[key] = value;
		}
                handler(
                    xhrProgressEvent.currentTarget.status,
                    xhrProgressEvent.currentTarget.responseText,
		    headers);
            };
            request.open(verb, url);
            for (var key in headers){
                if (headers.hasOwnProperty(key)){
                    request.setRequestHeader(key, headers[key]);
                }
            }
            // This is required for firefox, which sets it's own Accept otherwise
            request.setRequestHeader("Accept", "application/json");
            request.send(data);
        };
        return core;
    }()
);

window.onload = function(){
    core.startAll();
};