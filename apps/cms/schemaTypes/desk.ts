import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'desk',
  title: 'Desk',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: rule => rule.required(),
    }),
    defineField({
      name: 'equipment',
      title: 'Equipment',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: ['Wi-Fi', 'Monitor', 'Headphones', 'Keyboard'],
      },
    }),
    defineField({
      name: 'location',
      title: 'Location',
      type: 'reference',
      to: [{ type: 'location' }],
    }),
  ],
});
