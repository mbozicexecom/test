(function () {
    var apiKey = 'URhhjTGds3KULDlL';
    var androidProjectNumber = '930173497200';
    var emulatorMode = true;

    var everlive = new Everlive(apiKey);

    var onAndroidPushReceived = function (args) {
        alert('Android notification received: ' + JSON.stringify(args));
    };
    var onIosPushReceived = function (args) {
        alert('iOS notification received: ' + JSON.stringify(args));
    };
    var onWindowsPushRecieved = function (args) {
        alert('windows notification received: ' + JSON.stringify(args));
    }

    var enablePushNotifications = function () {
        var pushSettings = {
            android: {
                senderID: androidProjectNumber
            },
            iOS: {
                badge: "true",
                sound: "true",
                alert: "true"
            },
            notificationCallbackAndroid: onAndroidPushReceived,
            notificationCallbackIOS: onIosPushReceived,
            notificationCallbackWindowsPhone: onWindowsPushRecieved
        }
        $("#initializeButton").hide();
        $("#messageParagraph").text("Initializing push notifications...");
        var currentDevice = everlive.push.currentDevice(emulatorMode);
        currentDevice.enableNotifications(pushSettings)
            .then(
                function (initResult) {
                    $("#tokenLink").attr('href', 'mailto:test@example.com?subject=Push Token&body=' + initResult.token);
                    $("#messageParagraph").html("Checking registration status...");
                    return currentDevice.getRegistration();
                },
                function (err) {
                    $("#messageParagraph").html("ERROR!<br /><br />An error occured while initializing the device for push notifications.<br/><br/>" + err.message);
                }
        ).then(
            function (registration) {
                onDeviceIsRegistered();
            },
            function (err) {
                if (err.code === 801) {} else {
                    $("#messageParagraph").html("ERROR!<br /><br />An error occured while checking device registration status: <br/><br/>" + err.message);
                }
            }
        );
    };
    var registerInEverlive = function () {
        var currentDevice = everlive.push.currentDevice();
        if (!currentDevice.pushToken)
            currentDevice.pushToken = "some token";
        everlive.push.currentDevice()
            .register({
                UserId: 15
            })
            .then(
                onDeviceIsRegistered,
                function (err) {
                    alert('REGISTER ERROR: ' + JSON.stringify(err));
                }
        );
    };

    var onDeviceIsRegistered = function () {
        $("#loading").hide();
        $("#content").show();
    };

    document.addEventListener("deviceready", function () {
        enablePushNotifications();
        registerInEverlive();

        document.getElementById("cameraButton").addEventListener("click", function () {
            var success = function (data) {
                navigator.notification.alert("Take picture successfull");
                $("takenDiv").show();
                var imgData = "data:image/jpeg;base64," + data;
                document.getElementById("takenImg").innerHTML = "<image src=\"" + imgData + "\" data=\"" + imgData + "\" />";

                everlive.push.notifications.create({
                        Message: 'Test push'
                    },
                    function (data) {
                        alert(JSON.stringify(data));
                    },
                    function (error) {
                        alert(JSON.stringify(error));
                    });
            }

            var error = function () {
                navigator.notification.alert("Take picture fail");
            }

            var config = {
                destinationType: Camera.DestinationType.DATA_URL,
                targetHeight: 400,
                targetWidth: 400
            };
            navigator.camera.getPicture(success, error, config);
        }, false);
    });

    var mobileApp = new kendo.mobile.Application(document.body, {
        transition: 'slide',
        layout: 'mobile-tabstrip'
    });
}());