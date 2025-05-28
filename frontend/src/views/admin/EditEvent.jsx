import { useParams } from "react-router-dom";
import EventForm from "../../components/EventForm";

const EditEvent = () => {
  const { id } = useParams();

  return <EventForm eventId={id} mode="edit" />;
};

export default EditEvent;
