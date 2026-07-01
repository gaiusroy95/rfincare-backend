import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../../../components/AppIcon';

const FAQSection = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      id: 1,
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      id: 2,
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      id: 3,
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      id: 4,
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      id: 5,
      question: t('faq.q5'),
      answer: t('faq.a5')
    },
    {
      id: 6,
      question: t('faq.q6'),
      answer: t('faq.a6')
    },
    {
      id: 8,
      question: t('faq.q8'),
      answer: t('faq.a8')
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section className="bg-muted py-12 md:py-16 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-3 md:mb-4">
            {t('faq.title')}
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-muted-foreground">
            {t('faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqs?.map((faq, index) => (
            <div
              key={faq?.id}
              className="bg-card rounded-lg border border-border overflow-hidden transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-4 md:p-6 text-left"
              >
                <span className="text-base md:text-lg font-semibold text-foreground pr-4">
                  {faq?.question}
                </span>
                <Icon
                  name={openIndex === index ? 'ChevronUp' : 'ChevronDown'}
                  size={24}
                  className="flex-shrink-0 transition-transform duration-300"
                  color="var(--color-primary)"
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-4 md:px-6 pb-4 md:pb-6">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {faq?.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 md:mt-12 text-center">
          <p className="text-sm md:text-base text-muted-foreground mb-4">
            {t('faq.stillHaveQuestions')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`mailto:${t('footer.email')}`}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Icon name="Mail" size={20} />
              <span>{t('faq.emailSupport')}</span>
            </a>
            <a
              href={`tel:${t('footer.phone')}`}
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity"
            >
              <Icon name="Phone" size={20} />
              <span>{t('faq.callUs')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;