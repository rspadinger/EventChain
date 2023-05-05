import React from "react"
import { Container, Header } from "semantic-ui-react"

export default () => {
    return (
        <Container text style={{ marginTop: "7em", textAlign: "center" }}>
            <Header as="h1">Page Not Found</Header>

            <p style={{ marginBottom: "200px", marginTop: "20px" }}>
                Sorry, this page does not exist
            </p>
        </Container>
    )
}
