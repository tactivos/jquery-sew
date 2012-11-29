/**
 * jQuery plugin for getting position of cursor in textarea

 * @license under dfyw (do the fuck you want)
 * @author leChantaux (@leChantaux)
 */

;(function($, window, undefined) {
	// Create the defaults once
	var elementFactory = function(element, value) {
		element.text(value.val);
	};

	var pluginName = 'sew',
		document = window.document,
		defaults = {token: '@', elementFactory: elementFactory, values: []};

	function Plugin(element, options) {
		this.element = element;
		this.$element = $(element);
		this.$itemList = $(Plugin.MENU_TEMPLATE);

		this.options = $.extend({}, defaults, options);
		this.reset();

		this._defaults = defaults;
		this._name = pluginName;

		this.expression = new RegExp('(?:^|\\b|\\s)' + this.options.token + '([\\w.]*)$');
		this.cleanupHandle = null;

		this.init();
	}

	Plugin.MENU_TEMPLATE = "<div class='-sew-list-container' style='display: none; position: absolute;'><ul class='-sew-list'></ul></div>";

	Plugin.ITEM_TEMPLATE = '<li class="-sew-list-item"></li>';

	Plugin.KEYS = [40, 38, 13, 27, 9];

	Plugin.prototype.init = function() {
		if(this.options.values.length < 1) return;

		this.$element
								.bind('keyup', this.onKeyUp.bind(this))
								.bind('keydown', this.onKeyDown.bind(this))
								.bind('focus', this.renderElements.bind(this, this.options.values))
								.bind('blur', this.remove.bind(this));
	};

	Plugin.prototype.reset = function() {
		this.index = 0;
		this.matched = false;
		this.dontFilter = false;
		this.lastFilter = undefined;
		this.filtered = this.options.values.slice(0);
	};

	Plugin.prototype.next = function() {
		this.index = (this.index + 1) % this.filtered.length;
		this.hightlightItem();
	};

	Plugin.prototype.prev = function() {
		this.index = (this.index + this.filtered.length - 1) % this.filtered.length;
		this.hightlightItem();
	};

	Plugin.prototype.select = function() {
		this.replace(this.filtered[this.index].val);
		this.hideList();
	};

	Plugin.prototype.remove = function() {
		this.$itemList.fadeOut('slow');

		this.cleanupHandle = window.setTimeout(function(){
			this.$itemList.remove();
		}.bind(this), 1000);
	};

	Plugin.prototype.replace = function(replacement) {
		var startpos = this.getSelectionStart();
		var fullStuff = this.$element.val();
		var val = fullStuff.substring(0, startpos);
		val = val.replace(this.expression, ' ' + this.options.token + replacement);
		var finalFight = val + ' ' + fullStuff.substring(startpos, fullStuff.length);
		this.$element.val(finalFight);
		this.setCursorPosition(val.length+1);
	};

	Plugin.prototype.hightlightItem = function() {
		this.$itemList.find(".-sew-list-item").removeClass("selected");

		var container = this.$itemList.find(".-sew-list-item").parent();
		var element = this.filtered[this.index].element.addClass("selected");

		var scrollPosition = element.position().top;
		container.scrollTop(container.scrollTop() + scrollPosition);
	};

	Plugin.prototype.renderElements = function(values) {
		$("body").append(this.$itemList);

		var container = this.$itemList.find('ul').empty();
		values.forEach(function(e, i) {
			var $item = $(Plugin.ITEM_TEMPLATE);

			this.options.elementFactory($item, e);

			e.element = $item.appendTo(container)
												.bind('click', this.onItemClick.bind(this, e))
												.bind('mouseover', this.onItemHover.bind(this, i));
		}.bind(this));

		this.index = 0;
		this.hightlightItem();
	};

	Plugin.prototype.displayList = function() {
		if(!this.filtered.length) return;

		this.$itemList.show();
		var element = this.$element;
		var offset = this.$element.offset();
		var pos = element.getCaretPosition();

		this.$itemList.css({
			left: offset.left + pos.left,
			top: offset.top + pos.top
		});
	};

	Plugin.prototype.hideList = function() {
		this.$itemList.hide();
		this.reset();
	};

	Plugin.prototype.filterList = function(val) {
		if(val == this.lastFilter) return;

		this.lastFilter = val;
		this.$itemList.find(".-sew-list-item").remove();

		var vals = this.filtered = this.options.values.filter(function(e) {
			return	val === "" ||
							e.val.toLowerCase().indexOf(val.toLowerCase()) >= 0 ||
							(e.meta || "").toLowerCase().indexOf(val.toLowerCase()) >= 0;
		});

		if(vals.length) {
			this.renderElements(vals);
			this.$itemList.show();
		} else {
			this.hideList();
		}
	};

	Plugin.prototype.getSelectionStart = function() {
		input = this.$element[0];

		var pos = input.value.length;

		if(typeof(input.selectionStart) != "undefined") {
			pos = input.selectionStart;
		} else if(input.createTextRange) {
			var r = document.selection.createRange().duplicate();
			r.moveEnd('character', input.value.length);
			if(r.text === '') pos = input.value.length;
			pos = input.value.lastIndexOf(r.text);
		}

		return pos;
	};

	Plugin.prototype.setCursorPosition = function(pos) {
		if (this.$element.get(0).setSelectionRange) {
			this.$element.get(0).setSelectionRange(pos, pos);
		} else if (this.$element.get(0).createTextRange) {
			var range = this.$element.get(0).createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
	};

	Plugin.prototype.onKeyUp = function(e) {
		var startpos = this.getSelectionStart();
		var val = this.$element.val().substring(0, startpos);
		var matches = val.match(this.expression);

		if(!matches && this.matched) {
			this.matched = false;
			this.dontFilter = false;
			this.hideList();
			return;
		}

		if(matches && !this.matched) {
			this.displayList();
			this.lastFilter = "\n";
			this.matched = true;
		}

		if(matches && !this.dontFilter) {
			this.filterList(matches[1]);
		}
	};

	Plugin.prototype.onKeyDown = function(e) {
		var listVisible = this.$itemList.is(":visible");
		if(!listVisible || (Plugin.KEYS.indexOf(e.keyCode) < 0)) return;

		switch(e.keyCode) {
		case 9:
		case 13:
			this.select();
			break;
		case 40:
			this.next();
			break;
		case 38:
			this.prev();
			break;
		case 27:
			this.$itemList.hide();
			this.dontFilter = true;
			break;
		}

		e.preventDefault();
	};

	Plugin.prototype.onItemClick = function(element, e) {
		if(this.cleanupHandle)
			window.clearTimeout(this.cleanupHandle);

		this.replace(element.val);
		this.hideList();
	};

	Plugin.prototype.onItemHover = function(index, e) {
		this.index = index;
		this.hightlightItem();
	};

	$.fn[pluginName] = function(options) {
		return this.each(function() {
			if(!$.data(this, 'plugin_' + pluginName)) {
				$.data(this, 'plugin_' + pluginName, new Plugin(this, options));
			}
		});
	};
}(jQuery, window));
