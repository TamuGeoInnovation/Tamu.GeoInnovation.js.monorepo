$(document).ready(function() {
	floatingLabels();
	menuAnims();
	smoothScrolling();
	formEvents();
});

$(document).ajaxComplete(function() {
	floatingLabels();
});

function handlePreventDefault(element, event) {
	$(element).on('click mousedown', function() {
		event.stopPropagation();
		event.preventDefault();
	});
}

function setActivePage() {
	$("#link" + pageTitle).removeClass().addClass('active');
	$('#sectionLabel').html('<h2>' + $('nav#section-nav li a.active').text() + '</h2>')
}

function smoothScrolling() {
	$('html').on('click', 'a[href*=#]:not([href=#])', function() {
		if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {

			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
			if (target.length) {
				$('html,body').animate({
					scrollTop: target.offset().top
				}, 450);
				if (target.hasClass('target')) {
					target.addClass('active').siblings().removeClass('active');
				}
				return false;
			}
		}
	});
}

function floatingLabels() {
	//Checks for content in input fields on page load.
	var $this = $('input, textarea, select');
	$this.each(function(i) {
		if ($(this).val()) {
			if ($(this).val().length !== 0) {
				$(this).next('label').addClass('changed');
			}
		}
	});

	//listens for changes in content fields and applies floating label
	//    $('input , textarea, select').on('keyup keypress change', function () {
	$('html').delegate('input , textarea, select', 'keyup keypress change', function() {
		$(this).next('label').addClass('changed');
		if ($(this).val().length === 0) {
			$(this).next('label').removeClass('changed');
		}
	});

}

function NotificationToast(messageText, action, link) {

	if (action) {
		$('html').append("<div class='notification action animate-in'><span class='message'>" + messageText + "</span><a href='" + link + "' class='action'>" + action + "</a></div>");
	} else {
		$('html').append("<div class='notification animate-in'><span class='message'>" + messageText + "</span></div>");
	}

	function removeAnimateIn() {
		$('.notification').removeClass('animate-in');
	}

	function addAnimateOut() {
		$('.notification').addClass('animate-out');
	}

	function removeNotification() {
		$('.notification').remove();
	}

	////////////////////////TIMING PROPERTIES////////////////////////
	window.setTimeout(removeAnimateIn, 250);
	window.setTimeout(addAnimateOut, 9250);
	window.setTimeout(removeNotification, 9500);

}

function menuAnims() {
	//[DE]ACTIVATION FOR BOTH BUTTON AND SLIDING OFF-CANVAS MENU
	$('nav #menu-button-container').on("click", function() {
		recycler();
		if (!$(this).children().hasClass('active')) {
			$(this).children().addClass('active');
			$('nav#off-canvas-menu').addClass('active');
			$('form#aspnetForm').append("<div id='modal-bg'></div>").delay(1).queue(function() {
				$('#modal-bg').addClass('active');
				$(this).addClass('modal-open');
				initializer();
				$(this).dequeue();
			});
			$('html').addClass('modal-open');
		} else {
			$(this).children().removeClass('active').addClass('deactivate');
			$('nav#off-canvas-menu').removeClass('active');
			$('html').removeClass('modal-open');
			$('#modal-bg').removeClass('active').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
				recycler();
			});
		}
	});

	$('nav#off-canvas-menu li').click(function() {
		$('nav #menu-button-container').children().removeClass('active').addClass('deactivate');
		$('nav#off-canvas-menu').removeClass('active');
		$('html').removeClass('modal-open');
		$('#modal-bg').removeClass('active').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
			recycler();
		});
	});

	$('#ellipsis').click(function() {
		$('nav#section-nav').toggleClass('expanded');
	});

	$('#filter-toggle').click(function() {
		$(this).toggleClass('active');
		$('#filters').toggleClass('expanded');
	});

	$('#filters li').click(function() {
		$(this).toggleClass('selected');
	});
}

function recycler() {
	$('html').find('#modal-bg:not(.active), #info-modal:not(.slide-in), #info-modal.transparent-out').remove();
	$('html').removeClass('modal-open');
}

function initializer() {
	$('#modal-bg').click(function() {
		$('nav #menu-button-container').children().removeClass('active').addClass('deactivate');
		$('nav#off-canvas-menu').removeClass('active');
		$('html').removeClass('modal-open');
		$('#modal-bg').removeClass('active').on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
			recycler();
		});
	});
}

function modalCommonInteractions() {
	$("#modal-close-button").click(function() {
		$('#info-modal').addClass('transparent-out');
		$("#info-modal .card").addClass("fade-out").on('animationend webkitAnimationEnd oAnimationEnd', function() {
			recycler();
		});
	});

	$("#modal-close-button-container #modal-back-button, #info-modal.transparent").click(function(e) {

		$('#info-modal').addClass('transparent-out');

		$("#info-modal .card").addClass("fade-out").on('animationend webkitAnimationEnd oAnimationEnd', function() {
			recycler();
		});
	}).children().click(function(e) {
		e.stopPropagation(); //Stop bubbling up to the parent and prevent function running if clicked anywhere within the card itself.
	});

	$("#modal-back-button-container #modal-back-button").click(function(e) {
		$(this).parents().find('.content-block.slide-in').removeClass('slide-in')

	});

	$(document).keyup(function(e) {
		if (e.keyCode == 13) {
			$('.button:first').trigger('click');
		}

		if (e.keyCode == 27) {
			$("#info-modal").removeClass("slide-in").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
				recycler();
			});
		}
	});
}

function modalPaneGeneric() {
	$('table').delegate(".clickableRow", "click", function() {
		var rowData = $(this).attr('data');
		$('html').append("<div id='info-modal'></div>").addClass('modal-open').delay(20).queue(function() {
			$('#info-modal').addClass('slide-in');
			$(this).dequeue();
		});
		var dir = (window.location.pathname).substring(0, window.location.pathname.lastIndexOf('/'));
		$('#info-modal').load(dir + "/Modal.aspx .modal-container",
			function() {
				$('#info-modal').children().addClass('container12');
				$('#info-modal').children().prepend('<span id="close-help">Press "esc" to close.</span><div title="Close" id="modal-close-button-container"><span id="modal-close-button"></span></div>');

				ModalInit(rowData);

				$("#modal-close-button-container").click(function() {
					$("#info-modal").removeClass("slide-in").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
						recycler();
					});
				});

				$(document).keyup(function(e) {
					if (e.keyCode == 27) {
						$("#info-modal").removeClass("slide-in").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
							recycler();
						});
					}

					if (e.keyCode == 13 && !$('#info-modal').find('.form')) {
						$('.button:first').trigger('click');
					} else if (e.keyCode == 13 && $('#info-modal').find('.form')) {
						$(this.activeElement).parent().parent().find('.button:first').trigger('click');
					}
				})
			});
	});
}

function modalPaneAdd() {
	/*Separate functions needed because of the differing content fragment*/
	$('#Add:not(.disabled)').click(function() {
		$('html').append("<div id='info-modal'></div>").addClass('modal-open').delay(20).queue(function() {
			$('#info-modal').addClass('slide-in');
			$(this).dequeue();
		});

		var dir = (window.location.pathname).substring(0, window.location.pathname.lastIndexOf('/'));
		$('#info-modal').load(dir + "/Modal.aspx .modal-add",
			function() {
				if ($("#Add").hasClass('ck-req')) {
					CKEDITOR.replace('txtBody');
				}
				$('#info-modal').children().addClass('container12');
				$('#info-modal').children().prepend('<span id="close-help">Press "esc" to close.</span><div title="Close" id="modal-close-button-container"><span id="modal-close-button"></span></div>');

				$("#modal-close-button-container").click(function() {
					$("#info-modal").removeClass("slide-in").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
						recycler();
					});
				});

				modalCommonInteractions();

				if (typeof LoadAddData !== 'undefined' && typeof LoadAddData === 'function') {

					if ($.isFunction(LoadAddData)) {
						LoadAddData();
					}
				}

			});
	});
}

function loadBasicForm() {
	var pathToREST = baseRestUrl + "Form/Get/?appId=" + appId;
	$.getJSON(pathToREST, {})
		.done(function(data, status, jqHXR) {
			var content;

			$.each(data.questions, function(i, item) {
				if (item.questionInputType === "YesNoMaybe") {
					content = "";
					content += "<div class='form-input' questionID=" + item.questionId + " type='" + item.questionInputType + "'>";
					content += "<div>";
					content += "<p>" + item.questionText + "</p>";
					content += "<div class='radio-group'><input type='radio' name='" + item.questionId + "' value='Yes'><i></i><span>Yes</span></div>";
					content += "<div class='radio-group'><input type='radio' name='" + item.questionId + "' value='No'/><i></i><span>No</span></div>";
					content += "<div class='radio-group'><input type='radio' name='" + item.questionId + "' value='Maybe'/><i></i><span>Maybe</span></div>";
					content += "</div>";
					content += "</div>"

				} else if (item.questionInputType === "Spinner") {
					var options = "";
					$.each(item.possibleAnswers, function(i, option) {
						options += "<option value='" + option.possibleAnswer + "'>" + option.possibleAnswer + "</option>";
					});

					content = "";
					content += "<div class='form-input' questionID=" + item.questionId + " type='" + item.questionInputType + "'>";
					content += "<div>";
					content += "<p>" + item.questionText + "</p>";
					content += "<select>";
					content += "<option value='null'>--Select Option--</option>";
					content += options;
					content += "</select>";
					content += "</div>";
					content += "</div>"

				} else if (item.questionInputType === "Stepper") {
					content = "";
					content += "<div class='form-input' questionID=" + item.questionId + " type='" + item.questionInputType + "'>";
					content += "<div>";
					content += "<p>" + item.questionText + "</p>";
					content += "<input type='number' value='0'>";
					content += "</div>"
					content += "</div>"
				}

				//                $('.large-form').append(content);
				$(content).insertAfter('.large-form h2')

			});
		})
		.fail(function(data, status, jqHXR) {
			NotificationToast('Error: ' + status);
		})
}

function modalPaneAddReport() {
	/*Separate functions needed because of the differing content fragment*/
	$('#root.data').click(function() {
		$('html').append("<div id='info-modal'></div>").addClass('modal-open').delay(20).queue(function() {
			$('#info-modal').addClass('slide-in');
			$(this).dequeue();
		});

		var dir = (window.location.pathname).substring(0, window.location.pathname.lastIndexOf('/'));
		$('#info-modal').load(dir + "/Modal.aspx .modal-init",
			function() {
				$('#info-modal').children().addClass('container12');
				$('#info-modal').children().prepend('<span id="close-help">Press "esc" to close.</span><div title="Close" id="modal-close-button-container"><span id="modal-close-button"></span></div>');

				$("#modal-close-button-container").click(function() {
					$("#info-modal").removeClass("slide-in").on('transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function() {
						recycler();
					});
				});

				loadBasicForm();

				modalCommonInteractions();
			});
	});
}

function swapCardContent(id, elem) {
	//received data is the ID of the content to swap for.
	if ($(elem).hasClass('disabled')) {
		return false;
	} else {
		var elem = $(id);

		elem.toggleClass('slide-in');

		if (elem.siblings().hasClass('slide-in')) {
			elem.siblings().removeClass('slide-in');
		}
	}
}

function formEvents() {
	// Set default selector name
	const formSelector = ".small-form";

	// Try and get all the matching elements in the page
	let elems = Array.from(document.querySelectorAll(formSelector));

	// If the DOM query returns elements, attach event handlers
	if (elems.length > 0) {
		elems.forEach((elem) => {
			elem.addEventListener('keyup', (e) => {
				if (e.keyCode == 13) {
					// Try and find a default button
					const buttonSelector = '.button.default';
					const buttonSelectorFallback = '.button:first-child';

					// Select a button, if any. Will first try to target button with a default class. If none, it will try to fall back to the first button in the form
					const buttonElem = elem.querySelector(buttonSelector) ? elem.querySelector(buttonSelector) : elem.querySelector(buttonSelectorFallback);

					if (buttonElem) {
						buttonElem.click();
					}
				}
			})
		})
	}
}
