/**
 * Main landingPage application
 */

define([
    'jquery',
    'app/init',
    'app/util',
    'app/render',
    'app/ccp',
    'blueImpGallery',
    'bootbox',
    'app/ui/header',
    'app/ui/logo',
    'app/ui/demo_map',
    'dialog/settings',
    'dialog/notification',
    'dialog/manual'
], function($, Init, Util, Render, CCP, Gallery, bootbox) {

    'use strict';

    var config = {
        // header
        splashOverlayClass: 'pf-splash',                                        // class for "splash" overlay
        headerContainerId: 'pf-header-container',                               // id for header container
        logoContainerId: 'pf-logo-container',                                   // id for main header logo container
        headHeaderMapId: 'pf-header-map',                                       // id for header image (svg animation)

        // navigation
        navigationElementId: 'pf-navbar',                                       // id for navbar element
        navigationLinkManualClass: 'pf-navbar-manual',                          // class for the "manual" trigger link

        // login form
        loginFormId: 'pf-login-form',                                           // id for login form
        loginButtonClass: 'pf-login-button',                                    // class for "login" button(s)
        registerButtonClass: 'pf-register-button',                              // class for "register" button(s)
        loginMessageContainerId: 'pf-login-message-container',                  // id for login form message container

        // gallery
        galleryId: 'pf-gallery',                                                // id for gallery container
        galleryThumbContainerId: 'pf-landing-gallery-thumb-container',          // id for gallery thumb images
        galleryCarouselId: 'pf-landing-gallery-carousel',                       // id for "carousel" element

        // animation
        animateElementClass: 'pf-animate-on-visible'                            // class for elements that will be animated to show
    };


    var setPageObserver = function(){


        // login form =====================================================================================
        // register buttons ---------------------------------------------
        $('.' + config.registerButtonClass).on('click', function(e){
            e.preventDefault();

            // show register/settings dialog
            $.fn.showSettingsDialog(true);
        });


        // login buttons ------------------------------------------------
        $('.' + config.loginButtonClass).on('click', function(e){
            e.preventDefault();

            var loginForm = $('#' + config.loginFormId);
            var loginFormMessageContainer = $('#' + config.loginMessageContainerId);

            // validate form
            loginForm.validator('validate');

            // check weather the form is valid
            var formValid = loginForm.isValidForm();

            if(formValid === true){

                // show splash overlay
                $('.' + config.splashOverlayClass).showSplashOverlay(function(){

                    var loginData = {loginData: loginForm.getFormValues()};

                    $.ajax({
                        type: 'POST',
                        url: Init.path.logIn,
                        data: loginData,
                        dataType: 'json'
                    }).done(function(data){

                        // login error
                        if(data.error !== undefined){
                            $('.' + config.splashOverlayClass).hideSplashOverlay();
                            loginFormMessageContainer.showMessage({title: 'Login failed', text: ' please try again', type: 'error'});

                        }else if(data.reroute !== undefined){
                            window.location = Util.buildUrl(data.reroute);
                        }
                    }).fail(function( jqXHR, status, error) {
                        $('.' + config.splashOverlayClass).hideSplashOverlay();

                        var reason = status + ' ' + error;
                        Util.showNotify({title: jqXHR.status + ': login', text: reason, type: 'error'});

                        // show Form message
                        loginFormMessageContainer.showMessage({title: 'Login failed', text: ' internal server error', type: 'error'});
                    });
                });
            }
        });

        // manual -------------------------------------------------------
        $('.' + config.navigationLinkManualClass).on('click', function(){
            $.fn.showMapManual();
        });


        // tooltips -----------------------------------------------------
        /*
        var mapTooltipOptions = {
            toggle: 'tooltip',
            placement: 'top',
            container: 'body',
            delay: 150
        };

        $('[title]').tooltip(mapTooltipOptions);
        */
    };


    /**
     * init image carousel
     */
    var initCarousel = function(){

        // extent "blueimp" gallery for a textFactory method to show HTML templates
        Gallery.prototype.textFactory = function (obj, callback) {
            var newSlideContent = $('<div>')
                .addClass('text-content');

            var moduleConfig = {
                name: obj.href, // template name
                position: newSlideContent,
                functions: {
                    after: function(){
                        // element inserted -> load complete
                        callback({
                            type: 'complete',
                            target: newSlideContent[0]
                        });
                    }
                }
            };

            // render HTML file (template)
            var moduleData = {
                id: config.headHeaderMapId
            };

            Render.showModule(moduleConfig, moduleData);

            return newSlideContent[0];
        };

        // initialize carousel ------------------------------------------
        var carousel = Gallery([
            {
                title: 'Map',
                href: 'ui/map',
                type: 'text/html'
            },
            {
                href: 'public/img/landing/responsive.jpg',
                title: 'Image 1',
                type: 'image/jpg',
                thumbnail: ''
            },
            {
                href: 'public/img/landing/pathfinder_1.jpg',
                title: 'Image 1',
                type: 'image/jpg',
                thumbnail: ''
            },
            {
                href: 'public/img/landing/pathfinder_2.jpg',
                title: 'Image 1',
                type: 'image/jpg',
                thumbnail: ''
            }, {
                href: 'http://img5.fotos-hochladen.net/uploads/s51600x1200a2j7rqp4ig.jpg',
                title: 'Image 2',
                type: 'image/jpg',
                thumbnail: ''
            }
        ], {
            container: '#' + config.galleryCarouselId,
            carousel: true,
            startSlideshow: false,
            titleProperty: 'img-title', // attr renamed to prevent bootstrap tooltips for images
            transitionSpeed: 400,
            slideshowInterval: 5000,
            onopened: function () {
                // Callback function executed when the Gallery has been initialized
                // and the initialization transition has been completed.
                // -> show "demo" map

                $('#' + config.headHeaderMapId).drawDemoMap(function(){
                    // when map is shown -> start carousel looping
                    carousel.play();
                });

            }
        });
    };

    /**
     * init image gallery
     */
    var initGallery = function(){

        requirejs(['blueImpGalleryBootstrap'], function() {
            // thumb links
            var thumbLinks = $('#' + config.galleryThumbContainerId + ' a');

            var borderless = false;

            var galleryElement = $('#' + config.galleryId);
            galleryElement.data('useBootstrapModal', !borderless);
            galleryElement.toggleClass('blueimp-gallery-controls', borderless);

            // init gallery on click
            thumbLinks.on('click', function(e){
                e.preventDefault();

                e = e || window.event;
                var target = e.target || e.srcElement;
                var link = target.src ? target.parentNode : target;

                var options = {
                    index: link,
                    event: e,
                    container: '#' + config.galleryId,
                    titleProperty: 'description'
                };

                Gallery(thumbLinks, options);
            });
        });
    };


    /**
     * init scrollspy for navigation bar
     */
    var initScrollspy = function(){
        // init scrollspy

        // show elements that are currently in the viewport
        var showVisibleElements = function(){
            // find all elements that should be animated
            var visibleElements = $('.' + config.animateElementClass).isInViewport();

            $(visibleElements).removeClass( config.animateElementClass );

            $(visibleElements).velocity('transition.flipXIn', {
                duration: 600,
                stagger: 60,
                delay: 500,
                complete: function(element){
                    $(element).find('.fade').addClass('in');
                },
                visibility: 'visible'
            });
        };

        $( window ).scroll(function() {
            // check for new visible elements
            showVisibleElements();
        });

        // initial check for visible elements
        showVisibleElements();

        // event listener for navigation links
        $('.page-scroll').on('click', function(){
            // get element to scroll
            var anchorTag = $(this).attr('data-anchor');

            // scroll to container
            $(anchorTag).velocity('scroll', {
                duration: 300,
                easing: 'swing'
            });
        });
    };

    /**
     * main init landing page
     */
    $(function(){

        // show log off message
        var isLogOut = location.search.split('logout')[1];

        if(isLogOut !== undefined){
            // show logout dialog
            var options = {
                buttons: {
                    close: {
                        label: 'close',
                        className: ['btn-default'].join(' ')
                    }
                },
                content: {
                    icon: 'fa-sign-out',
                    class: 'txt-color-warning',
                    title: 'Log off',
                    headline: 'Logged off',
                    text: ['You are automatically logged off']
                }
            };

            $.fn.showNotificationDialog(options);
        }

        // init scrollspy
        initScrollspy();

        // hide splash loading animation
        $('.' + config.splashOverlayClass).hideSplashOverlay();

        // init carousel
        initCarousel();

        // init gallery
        initGallery();

        // show logo -> hide animation in IGB
        if( !CCP.isInGameBrowser() ){
            $('#' + config.logoContainerId).drawLogo(function(){

                // init header animation
                $('#' + config.headerContainerId).initHeader();
            }, false);
        }


        setPageObserver();

    });

});