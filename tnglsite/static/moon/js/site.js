$(document).ready(function() {
    var csrftoken = Cookies.get('csrftoken'); //getCookie('csrftoken');

    $("#edit-device-name-form").hide();

    $("#edit-device-name-button").click(function() {
        $("#device-name").hide();
        $("#edit-device-name-form").show();
    });

    $("#cancel-edit-device-name").click(function() {
        $("#device-name").show();
        $("#edit-device-name-form").hide();
    });

    $("#dissociate-button").click(function() {
        var device_id = $("#device-id").data("device-id");

        if (device_id == null || device_id === "")
            return;

        var res = confirm("Are you sure you would like to dissociate this device?")

        if (res == true) {
            console.log("deleting");
            $.post("/lampi/device/dissociate/",
                {
                    csrfmiddlewaretoken: csrftoken,
                    device_id: device_id
                },
                function(data, status) {
                console.log(data);
                    if (status == 'success') {
                        window.location = "/lamp";
                    }
            });
        }
    })
});

