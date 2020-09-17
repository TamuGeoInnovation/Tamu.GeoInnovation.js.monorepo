$(document).ready(function () {

    menuToggle();

    floatingLabels();

    $('textarea').autosize();

    commonFunctions();
});

function floatingLabels() {
    $('input , textarea, select').on('keyup keypress change', function () {
        $(this).next('label').addClass('changed');
        if ($(this).val().length === 0) {
            $(this).next('label').removeClass('changed');
        }
    });
}

function checkInputFields() {
    var $this = $('input, textarea, select');
    $this.each(function (i) {
        if ($(this).val().length !== 0) {
            $(this).next('label').addClass('changed');
        }
    });
}

function menuToggle() {
    $('.toggle').click(function () {
        if ($('.side-menu').hasClass('open')) {
            $('.side-menu').removeClass('open').delay(0).queue(function (next) {
                $('.side-menu').addClass('close');
                next();
            });

            $('body').removeClass('shift-state').delay(0).queue(function (next) {
                $('body').addClass('initial-state');
                next();
            });

        } else {
            $('.side-menu').removeClass('close').delay(0).queue(function (next) {
                $('.side-menu').addClass('open');
                next();
            });

            $('body').removeClass('initial-state').delay(0).queue(function (next) {
                $('body').addClass('shift-state');
                next();
            });

        }
    });
}

function NotificationToast(messageText) {
    $('html').append("<div class='notification animate-in'>" + messageText + "</div>");

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

function commonFunctions() {
    $('.ng-elem').on('keydown', function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
        }
    });
}