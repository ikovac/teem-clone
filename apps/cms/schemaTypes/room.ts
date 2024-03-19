import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'room',
  title: 'Room',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'capacity',
      title: 'Capacity',
      type: 'number',
      validation: rule => [rule.required(), rule.positive(), rule.integer()],
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'location' }],
    }),
  ],
});
