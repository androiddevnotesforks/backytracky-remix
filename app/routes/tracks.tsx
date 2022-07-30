import type { Track } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { deleteTrack } from "~/utils/tracks.server";

export const loader: LoaderFunction = async ({ request }) => {
  const data = {
    tracks: await db.track.findMany(),
    user: await getUser(request),
  };

  return json(data);
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const trackId = form.get("trackId");
  const response = await deleteTrack(trackId as string);

  if (response.status === 400) {
    return badRequest({
      error: `Error deleting track`,
    });
  }

  return json({ response });
};

const badRequest = (data: any) => json(data, { status: 400 });

const notifyDeleting = () =>
  toast.loading("Deleting...", { id: `track-delete-toast` });

const notifyErrorDeleting = () =>
  toast.error("Couldn't delete track...", {
    id: `track-delete-toast`,
  });

const notifySuccessDeleting = () =>
  toast.success("Deleted track!", { id: `track-delete-toast` });

export default function TracksRoute() {
  const actionData = useActionData();
  const loaderData = useLoaderData();
  const transition = useTransition();

  useEffect(() => {
    switch (transition.type) {
      case "actionSubmission":
        console.log("Deleting");
        if (transition.submission.action === "/tracks") {
          notifyDeleting();
        }
        break;
      case "actionRedirect":
        console.log("Redirecting=");
        break;
      case "actionReload":
        if (actionData.error) {
          notifyErrorDeleting();
        } else {
          notifySuccessDeleting();
        }
        break;
    }
  }, [transition, actionData]);

  return (
    <main className="main">
      <section>
        <div className="container max-w-4xl mx-auto pt-8">
          <h1>Tracks 🎺</h1>
          <div className="grid gap-4 my-8">
            {loaderData.tracks.map((track: Track) => (
              <div
                key={track.id}
                className="flex items-center justify-between rounded-lg p-4 interactive-bg"
              >
                <div className="flex items-center">
                  <span className="bg-orange-400 dark:bg-orange-600 rounded-full p-1 text-xs w-6 h-6 text-center mr-4">
                    {track.upvotes}
                  </span>
                  <Link
                    to={`/track/${track.id}`}
                    className="text-xl font-black hover:underline"
                  >
                    {track.name}
                  </Link>
                </div>
                {track.userId === loaderData.user?.id ? (
                  <Form method="delete">
                    <input type="hidden" name="trackId" value={track.id} />
                    <button className="icon-button button--delete">
                      <span>delete</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </Form>
                ) : (
                  ""
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
