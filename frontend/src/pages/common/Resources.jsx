import { Container, Row, Col, Button } from "react-bootstrap";

function Resources() {
  const notes = [
    { title: "Mechanics Notes", url: "/assets/mechanics.pdf" },
    { title: "Electromagnetism Notes", url: "/assets/electromagnetism.pdf" },
  ];

  const videos = [
    {
      title: "Combination of Error",
      url: "https://www.youtube.com/embed/0x4C32ylkJA",
    },
    {
      title: "Analysis/Estimation/Expression of Error",
      url: "https://www.youtube.com/embed/AEWh-w8RP1Q",
    },
    {
      title: "Least Count | Error in Measurements",
      url: "https://www.youtube.com/embed/xxRvrmTCNOo",
    },
    {
      title: "SYSTEM OF UNITS",
      url: "https://www.youtube.com/embed/wTe_aRXQZyU",
    },
    {
      title: "UNITS & MEASUREMENTS",
      url: "https://www.youtube.com/embed/Pcv7T5XfZSc",
    },
    {
      title: "UNITS OF MEASUREMENTS-01",
      url: "https://www.youtube.com/embed/c0q3r-m2bbk",
    },
  ];

  return (
    <div className="py-5">
      <Container>
        <h2 className="text-center mb-4 section-title">Downloadable Notes</h2>
        <section className="mb-5">
          <div className="d-flex justify-content-between mb-3">
            <div>
              <label htmlFor="standardDropdown" className="me-2">
                Standard:
              </label>
              <select
                id="standardDropdown"
                className="form-select d-inline-block w-auto"
              >
                <option value="all">All</option>
                <option value="standard-10">Standard 10</option>
                <option value="standard-12">Standard 12</option>
              </select>
            </div>
            <div>
              <label htmlFor="subjectDropdown" className="me-2">
                Subject:
              </label>
              <select
                id="subjectDropdown"
                className="form-select d-inline-block w-auto"
              >
                <option value="all">All</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="maths">Maths</option>
              </select>
            </div>
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Chapter Number</th>
                <th>Chapter Name</th>
                <th>Download Link</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{note.title}</td>
                  <td>
                    <a href={note.url} download>
                      Download
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mb-5">
          <h3 className="section-title">Video Lectures</h3>
          <p className="mb-5">
            Watch our video lectures to gain a deeper understanding of the
            concepts, and <b>subscribe to our YouTube channel</b> for more
            educational content.{" "}
          </p>
          <Row>
            {videos.map((video, i) => (
              <Col md={6} key={i} className="mb-4">
                <h5>{video.title}</h5>
                <iframe
                  width="100%"
                  height="315"
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                ></iframe>
              </Col>
            ))}
          </Row>
        </section>
      </Container>
    </div>
  );
}

export default Resources;
