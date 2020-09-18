$(function () {
    autoLeftNav();
    $(window).resize(function () {
        autoLeftNav();
    });
})

// 侧边菜单开关

function autoLeftNav() {
    if (window.screen.width < 1024) {
        $('.left-sidebar').addClass('active');
        $('.tpl-content-wrapper').addClass('active');
    } else {
        $('.left-sidebar').removeClass('active');
        $('.tpl-content-wrapper').removeClass('active');
    }
}

$('.tpl-header-switch-button').on('click', function () {
    if ($('.left-sidebar').is('.active')) {
        $('.tpl-content-wrapper').removeClass('active');
        $('.left-sidebar').removeClass('active');
    } else {

        $('.tpl-content-wrapper').addClass('active');
        $('.left-sidebar').addClass('active');
    }
})
