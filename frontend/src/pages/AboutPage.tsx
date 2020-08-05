import React from "react";
import { Container, Grid, Typography } from "@material-ui/core";

export const AboutPage = () => (
  <Container>
    <Grid container direction="row" justify="center">
      <Grid
        container
        item
        xs={11}
        sm={8}
        md={6}
        direction="column"
        style={{
          marginTop: "2.5rem",
          marginLeft: "0.5rem",
          marginRight: "0.5rem",
        }}
      >
        <Typography variant="h4">About</Typography>

        <Typography style={{ marginTop: "1rem" }}>
          plaud.io is a website where you can hear and say what matters. We take
          your text and convert it to audio, along with your audio clips and
          sound bites (like sound emojis). We can't wait to hear what you have
          to say!
        </Typography>

        <br />

        <Typography>
          Questions or comments can go to{" "}
          <a href="email:info@plaud.io">info@plaud.io</a>
        </Typography>

        <br />

        <Typography>
          Read our{" "}
          <a href={"https://www.iubenda.com/privacy-policy/56050697"}>
            Privacy Policy
          </a>{" "}
          and{" "}
          <a href={"https://www.iubenda.com/terms-and-conditions/56050697"}>
            Terms of Conditions
          </a>
        </Typography>
      </Grid>
    </Grid>
  </Container>
);
