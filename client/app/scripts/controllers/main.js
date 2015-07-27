'use strict';
/**
 * @ngdoc function
 * @name jadenSmithApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the jadenSmithApp
 * All of the image controls, such as searching and pulling a new image
 */

var app = angular.module('jadenSmithApp');


app.controller('MainCtrl', ['$scope','$rootScope','$route', '$resource','$location','$window','getTweets','getImages','generateImage', 
    function ($scope, $rootScope, $route, $resource, $location, $window, getTweets, getImages, generateImage) {
        $scope.username = 'officialjaden';
        $scope.justify = "center";
        $scope.align = "middle"
        $scope.isLoading = "ui teal basic button";

        $scope.tweets = [];
        $scope.timer;
        $scope.tweetPage = 0;
        $scope.imageList = new Array();

        $scope.tweetsLock = false;
        $scope.imagesLock = false;
        $scope.userNotFound = false;        
        $scope.showImages = false;
        $scope.imageStatusEnd = false;
        $scope.canvas = document.createElement('canvas');
        $scope.image;

        $scope.init = function(){
        $scope.imagesLock = true;
        getImages().then(function(image){
        	$scope.image = image;
        });
        console.log("Found images");
        var urlParam = $location.search().username;
        if(urlParam){
            $scope.username = urlParam;
            $scope.onSearch();
            }  
        $scope.imagesLock = false; 
        }

        $scope.onSearch = function() {
            $scope.tweets = null;
            $scope.imageList = [];
            $location.search('username', $scope.username);
            $scope.isLoading = "ui loading button"
            console.log("Getting tweets");
            $scope.timer = new Date();
            $scope.tweetsLock = true;
            getTweets($scope.username).then(function(tweets){
                console.log(tweets);
                if(!tweets || tweets.length === 0){
                    $scope.userNotFound = true;
                    $scope.isLoading = "ui teal basic button";
                    $scope.timer = new Date() - $scope.timer;
                    $scope.errorMessage = "Twitter account " + $scope.username + " not found";
                    $scope.errorImage = getImage();
                    $scope.tweets = "";
                    console.log("Request handeled in " + $scope.timer + " milliseconds");   
                    return;      
                }
                $scope.userNotFound = false;        
                $scope.tweets = tweets;
                for (var tweet in tweets)
                {
                    $scope.getImage(tweets[tweet]);
                }
                $scope.tweetsLock = false;
                $scope.timer = new Date() - $scope.timer;
                console.log("Request handeled in " + $scope.timer + " milliseconds");   
            });
        };
        $scope.moreTweets = function(){
            if (!$scope.tweetsLock && $scope.username) $scope.moreTweetsLock();
        }

        $scope.moreTweetsLock = function() {
            $scope.tweetsLock = true;
            getTweets($scope.username).then(function(tweets){
                $scope.tweets = $scope.tweets.concat(tweets);
                $scope.imageStatusEnd = tweets.length === 0 ? true : false;
                for (var tweet in tweets) $scope.getImage(tweets[tweet]);
                $scope.tweetsLock = false;
            });
        };

        $scope.onNewJustify = function(justify, index){
            $scope.imageList[index] = (generateImage($scope.imageList[index].tweet,  $scope.imageList[index].image, $scope.username, justify, $scope.align));
        };
        $scope.onNewAlign = function(align, index){
            $scope.imageList[index] = (generateImage($scope.imageList[index].tweet, $scope.imageList[index].image, $scope.username, $scope.justify, align));
        }
        $scope.onDownload = function(index) {
            var poster = document.getElementById("poster" + index)
            angular.element(document).ready(function (){
                html2canvas(poster, {
                proxy: 'http://localhost:8080/',
                onrendered: function(canvas) {
                    $window.open(canvas.toDataURL('image/png'));   
                    console.log(canvas.toDataURL('image/png'));                   
                    }
                });
            });
        };
        $scope.newImage = function(index, tweet){
            $scope.timer = new Date();
              // if we need to get more images
            if(!$scope.imagesLock){
                $scope.imagesLock = true;
                console.log("No more images. Querying for more.");
                getImages().then(function(image) {
                    $scope.imageList[index] = (generateImage($scope.imageList[index].tweet, image, $scope.username, $scope.justify, $scope.align));
                    $scope.afterImage(); 
                });
            }
            
        
        }
        // pulls the next image, or queries for more images, if necessary
        $scope.getImage = function(tweet) {         
            // if we need to get more images
            if(!$scope.imagesLock){
                $scope.imagesLock = true;
                console.log("No more images. Querying for more.");
                getImages().then(function(image) {
                	$scope.image = image
                	console.log($scope.image);
                    $scope.drawImage(tweet);
                });                    
            }           
        };
        // actually calling the image generation class
        $scope.drawImage = function(tweet){
            $scope.imageList.push(generateImage(tweet, $scope.image, $scope.username, $scope.justify, $scope.align));
            $scope.afterImage();
        };
        $scope.afterImage = function(){
            $scope.isLoading = "ui teal basic button";
            $scope.showImages = true;
            $scope.imagesLock = false
        };
        var lastRoute = $route.current;
        $scope.$on('$locationChangeSuccess', function(event) {
           // $route.current = lastRoute;
        });
    }
]);

