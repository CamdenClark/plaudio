import React from "react";
import { Grid, Typography } from "@material-ui/core";

export const AboutPage = () => (
  <Grid container direction="row" justify="center">
    <Grid
      container
      item
      xs={12}
      sm={8}
      direction="column"
      style={{ marginTop: "2.5rem" }}
    >
      <Typography variant="h4">About</Typography>

      <Typography style={{ marginTop: "1rem" }}>
        plaud.io is a website where you can hear and say what matters. We take
        your text and convert it to audio, along with your audio clips and sound
        bites, and everyone votes on what's best. We can't wait to see what you
        have to say!
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
);
