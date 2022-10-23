class TeachableService {
  static createUser(email, password) {
    const url = "https://developers.teachable.com/v1/users";
    var myHeaders = new fetch.Headers();
    myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
      email: email,
      password: password,
    });

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    return fetch(url, requestOptions);
  }

  static enrollUser(body) {
    const url = "https://developers.teachable.com/v1/enroll";
    var myHeaders = new fetch.Headers();
    myHeaders.append("apiKey", "UjJtbn9z2kjVvoIQpPk7kTvKzE9lPH2c");
    myHeaders.append("Content-Type", "application/json");
    console.log(JSON.stringify(body));

    var requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(body),
      redirect: "follow",
    };

    return fetch(url, requestOptions);
  }
}
