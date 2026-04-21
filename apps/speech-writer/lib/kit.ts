const KIT_BASE = 'https://api.kit.com/v4';

async function kitPost(path: string, body: object) {
  const res = await fetch(`${KIT_BASE}${path}`, {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': process.env.KIT_API_KEY!.trim(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function tagKitSubscriber(email: string, tags: string[]): Promise<void> {
  const subData = await kitPost('/subscribers', { email_address: email, state: 'active', skip_email_confirmation: true });
  const subscriberId = subData.subscriber?.id;
  if (!subscriberId) throw new Error(`Kit subscriber upsert failed: ${JSON.stringify(subData)}`);

  for (const tagName of tags) {
    const tagData = await kitPost('/tags', { name: tagName });
    const tagId = tagData.tag?.id;
    if (!tagId) throw new Error(`Kit tag create/find failed for "${tagName}": ${JSON.stringify(tagData)}`);
    await kitPost(`/tags/${tagId}/subscribers/${subscriberId}`, {});
  }
}
